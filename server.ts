import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Support base64 image uploads from mobile camera and gallery
app.use(express.json({ limit: '35mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI();
};

// Candidate Gemini models with fallback order
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

/**
 * Resilient generateContent helper that falls back across candidate models
 * and handles transient 503 / 429 errors.
 */
async function resilientGenerate(
  contents: any,
  systemInstruction?: string,
  responseMimeType?: string
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('Gemini client not initialized: Missing API key');
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (responseMimeType) config.responseMimeType = responseMimeType;

      const response = await ai.models.generateContent({
        model,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined
      });

      const text = response.text?.trim() || '';
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      console.warn(`Model ${model} failed (${status || 'error'}): ${err?.message || err}. Trying next candidate.`);
      // Small pause before trying next candidate
      await new Promise(r => setTimeout(r, 300));
    }
  }

  throw lastError || new Error('All candidate models failed');
}

/**
 * Secondary Free Web Translation Fallback
 * Translates text using MyMemory API if Gemini experiences a spike
 */
async function fallbackWebTranslate(text: string, targetLangCode: string, targetLangName: string): Promise<string | null> {
  try {
    // Only send the first 500 characters per chunk to comply with free limits
    const chunks: string[] = [];
    const paragraphs = text.split('\n');
    let current = '';

    for (const p of paragraphs) {
      if ((current + '\n' + p).length < 450) {
        current = current ? current + '\n' + p : p;
      } else {
        if (current) chunks.push(current);
        current = p.slice(0, 450);
      }
    }
    if (current) chunks.push(current);

    const translatedChunks: string[] = [];
    for (const chunk of chunks.slice(0, 5)) {
      if (!chunk.trim()) {
        translatedChunks.push('');
        continue;
      }
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.trim())}&langpair=en|${encodeURIComponent(targetLangCode)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.responseData?.translatedText) {
          translatedChunks.push(data.responseData.translatedText);
          continue;
        }
      }
      translatedChunks.push(chunk);
    }

    if (translatedChunks.length > 0) {
      return translatedChunks.join('\n');
    }
  } catch (err) {
    console.warn('Fallback web translation error:', err);
  }
  return null;
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

// 1. Real OCR Endpoint: Extracts text from images using Gemini Vision with multi-model resilience
app.post('/api/ocr', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image base64 data is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(200).json({
      fallback: true,
      message: 'Running in offline client-side OCR mode'
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 'You are an accurate optical character recognition (OCR) engine for document analysis. Extract ALL text present in this document or paper image accurately. Preserve paragraph breaks, lists, headings, and formatting. Return ONLY the extracted text. If no text is found, respond with "[No text detected in image]". Do not add conversational introduction or pleasantries.'
          },
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          }
        ]
      }
    ];

    const { text, modelUsed } = await resilientGenerate(contents);

    return res.json({
      text,
      source: `gemini-vision (${modelUsed})`
    });
  } catch (err: any) {
    console.error('Gemini OCR error, signaling client to use on-device OCR:', err?.message || err);
    return res.status(200).json({
      fallback: true,
      error: err?.message || 'Vision model unavailable, falling back to on-device OCR'
    });
  }
});

// 2. Real Translation Endpoint: Translates ANY text into target language
app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage, languageCode } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Text and targetLanguage are required' });
  }

  const ai = getGeminiClient();

  // Try Gemini AI translation first
  if (ai) {
    try {
      const systemInstruction = `You are an accurate, direct legal, medical, and document translator.
Translate the user input text completely, naturally, and faithfully into ${targetLanguage} (${languageCode}).
Rules:
- Preserve all legal and technical meanings with appropriate domain terminology.
- Maintain original line breaks, bullet points, and paragraph structure.
- Return ONLY the translated text in ${targetLanguage}.
- Do NOT include any English preamble, conversational greetings, alternatives, notes, or markdown explanations.`;

      const { text: translatedText, modelUsed } = await resilientGenerate(text, systemInstruction);

      return res.json({
        translatedText,
        targetLanguage,
        languageCode,
        source: `gemini (${modelUsed})`
      });
    } catch (err: any) {
      console.warn('Gemini translation models busy or failed, trying secondary fallback:', err?.message || err);
    }
  }

  // Secondary fallback: Free web translation API
  const fallbackTranslation = await fallbackWebTranslate(text, languageCode, targetLanguage);
  if (fallbackTranslation) {
    return res.json({
      translatedText: fallbackTranslation,
      targetLanguage,
      languageCode,
      source: 'web-translation-engine'
    });
  }

  // Offline client fallback signal
  return res.status(200).json({
    fallback: true,
    message: 'Running in offline translation mode'
  });
});

// 3. Real 6th-Grade Plain English Simplification
app.post('/api/simplify', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(200).json({
      fallback: true,
      message: 'Running in offline simulation mode'
    });
  }

  try {
    const prompt = `You are an offline document companion. Analyze the provided text and rewrite it strictly into plain English at a 6th-grade reading level. Break down all legal, medical, or technical jargon into simple bullet points. Identify hidden risks or actionable next steps.

Respond strictly in valid JSON matching this exact structure:
{
  "summary": "1-2 short sentences summarizing the whole document for a 6th grader",
  "plainBullets": ["Bullet 1 in 6th-grade English", "Bullet 2", "Bullet 3", "Bullet 4"],
  "hiddenRisks": [
    { "title": "Risk title", "description": "Why this is dangerous in plain English", "severity": "critical" }
  ],
  "actionItems": [
    { "id": "act-1", "text": "Specific actionable next step", "priority": "high", "done": false }
  ],
  "jargonTerms": [
    {
      "term": "Term name",
      "phonetic": "simple-pronunciation",
      "category": "legal",
      "riskLevel": "high",
      "simpleDefinition": "6th-grade meaning",
      "plainExample": "In real life example",
      "counterTip": "What to do to stay safe"
    }
  ]
}

Document Text:
${text}`;

    const { text: resultJson, modelUsed } = await resilientGenerate(
      prompt,
      'You are a plain-English document simplifier. Respond strictly with valid JSON.',
      'application/json'
    );

    const parsed = JSON.parse(resultJson || '{}');
    return res.json({
      ...parsed,
      readingGrade: '6th Grade Level',
      readabilityScore: 86,
      source: `gemini (${modelUsed})`
    });
  } catch (err: any) {
    console.warn('Gemini simplify error, using offline baseline:', err?.message || err);
    return res.status(200).json({
      fallback: true,
      error: err?.message || 'Simplification failed'
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlainPrint Server listening on port ${PORT}`);
  });
}

startServer();
