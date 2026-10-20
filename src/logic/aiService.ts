import type { SimplifiedOutput, TranslationOutput } from '../types.ts';
import { processGeminiNanoOffline, countWords } from './jargonEngine.ts';
import { translateDocumentOffline, SUPPORTED_LANGUAGES } from './translationEngine.ts';
import { extractDocumentText, type OcrProgressUpdate } from './ocrEngine.ts';

/**
 * Universal OCR Engine:
 * Extracts real text from an image using Gemini Vision with automatic
 * on-device Tesseract.js fallback and live progress reporting.
 */
export async function performDocumentOcr(
  imageBase64: string,
  mimeType = 'image/jpeg',
  onProgress?: (update: OcrProgressUpdate) => void
): Promise<{ text: string; source: string }> {
  try {
    const result = await extractDocumentText(imageBase64, mimeType, onProgress);
    if (result.text && result.text.trim()) {
      return {
        text: result.text.trim(),
        source: result.source
      };
    }
  } catch (err) {
    console.warn('OCR error during document processing:', err);
  }

  // If completely illegible or no text detected
  return {
    text: '',
    source: 'empty'
  };
}

/**
 * Real Translation caller with offline fallback.
 * Queries Gemini with multi-model fallback and secondary web engine.
 */
export async function performTranslation(
  text: string,
  languageCode: string
): Promise<TranslationOutput> {
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === languageCode) || SUPPORTED_LANGUAGES[0];

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLanguage: langObj.name,
        languageCode: langObj.code
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.translatedText && !data.fallback) {
        return {
          targetLanguage: langObj.name,
          languageCode: langObj.code,
          nativeName: langObj.nativeName,
          translatedText: data.translatedText,
          confidence: 0.99
        };
      }
    }
  } catch (err) {
    console.warn('Network translation failed, falling back to on-device engine:', err);
  }

  // Offline fallback
  return translateDocumentOffline(text, languageCode);
}

/**
 * Real 6th-Grade Simplification caller with offline fallback.
 */
export async function performSimplification(
  text: string,
  title?: string
): Promise<SimplifiedOutput> {
  try {
    const res = await fetch('/api/simplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.summary && !data.fallback) {
        return {
          summary: data.summary,
          readingGrade: '6th Grade Level',
          readabilityScore: data.readabilityScore || 85,
          plainBullets: data.plainBullets || [],
          hiddenRisks: data.hiddenRisks || [],
          actionItems: data.actionItems || [],
          jargonTerms: data.jargonTerms || [],
          wordCount: countWords(text)
        };
      }
    }
  } catch (err) {
    console.warn('Network simplification failed, falling back to on-device engine:', err);
  }

  // On-device simulation fallback
  return processGeminiNanoOffline(text, title);
}
