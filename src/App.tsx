import React, { useState, useEffect } from 'react';
import type {
  DocumentData,
  JargonDefinition,
  PaywallTriggerContext,
  ProcessingMode,
  SimplifiedOutput,
  TranslationOutput,
  UserAccountState
} from './types.ts';
import {
  loadUserAccountState,
  checkPaywallTrigger,
  recordSuccessfulScan,
  simulateGooglePlayPurchase,
  resetAccountToFreeTier
} from './logic/billingEngine.ts';
import { processGeminiNanoOffline } from './logic/jargonEngine.ts';
import { translateDocumentOffline } from './logic/translationEngine.ts';
import { performTranslation, performSimplification } from './logic/aiService.ts';
import { SAMPLE_DOCUMENTS } from './logic/sampleDocuments.ts';
import { AndroidFrame } from './components/AndroidFrame.tsx';
import { ScannerScreen } from './components/ScannerScreen.tsx';
import { ProcessorScreen } from './components/ProcessorScreen.tsx';
import { JargonDecoderSheet } from './components/JargonDecoderSheet.tsx';
import { PaywallModal } from './components/PaywallModal.tsx';
import { KotlinCodeViewerModal } from './components/KotlinCodeViewerModal.tsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'scanner' | 'processor'>('scanner');
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('simplify');
  const [targetLangCode, setTargetLangCode] = useState<string>('es');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Account State
  const [userAccount, setUserAccount] = useState<UserAccountState>(() => loadUserAccountState());

  // Interactive Overlays
  const [selectedJargon, setSelectedJargon] = useState<JargonDefinition | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallTriggerContext, setPaywallTriggerContext] = useState<PaywallTriggerContext | null>(null);
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);

  // Derived processed data
  const [simplifiedData, setSimplifiedData] = useState<SimplifiedOutput>(() =>
    processGeminiNanoOffline(SAMPLE_DOCUMENTS[0].rawText, SAMPLE_DOCUMENTS[0].title)
  );
  const [translationData, setTranslationData] = useState<TranslationOutput>(() =>
    translateDocumentOffline(SAMPLE_DOCUMENTS[0].rawText, 'es')
  );

  // Document captured handler
  const handleDocumentScanned = async (doc: DocumentData) => {
    // Check if free scans remaining is 0
    if (!userAccount.isPro && userAccount.freeScansRemaining <= 0) {
      setPaywallTriggerContext({
        reason: 'quota_exhausted',
        scansLeft: 0,
        wordCount: doc.wordCount
      });
      setIsPaywallOpen(true);
      return;
    }

    // Fast initial local results so screen transitions immediately
    const initialSimplified = processGeminiNanoOffline(doc.rawText, doc.title);
    const initialTranslated = translateDocumentOffline(doc.rawText, targetLangCode);

    setSimplifiedData(initialSimplified);
    setTranslationData(initialTranslated);
    setCurrentDocument(doc);
    setCurrentScreen('processor');

    // Deduct 1 scan quota
    const updatedAccount = recordSuccessfulScan(userAccount);
    setUserAccount(updatedAccount);

    // If document is > 200 words and user is not Pro, simplify mode would require Pro
    if (!userAccount.isPro && doc.wordCount > 200) {
      setProcessingMode('simplify');
      setPaywallTriggerContext({
        reason: 'word_limit_exceeded',
        wordCount: doc.wordCount,
        scansLeft: updatedAccount.freeScansRemaining
      });
      setIsPaywallOpen(true);
    } else {
      setProcessingMode('simplify');
    }

    // Enrich with Gemini 3.8 Flash in background
    try {
      setIsTranslating(true);
      const [aiSimplified, aiTranslated] = await Promise.all([
        performSimplification(doc.rawText, doc.title),
        performTranslation(doc.rawText, targetLangCode)
      ]);
      setSimplifiedData(aiSimplified);
      setTranslationData(aiTranslated);
    } catch (err) {
      console.warn('Background AI enhancement error, keeping offline baseline:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle between "Simplify Jargon" and "Translate Language"
  const handleToggleMode = (newMode: ProcessingMode) => {
    if (!currentDocument) return;

    if (newMode === 'simplify') {
      const trigger = checkPaywallTrigger(userAccount, 'simplify', currentDocument.wordCount);
      if (trigger) {
        setPaywallTriggerContext(trigger);
        setIsPaywallOpen(true);
        return;
      }
    }

    setProcessingMode(newMode);
  };

  // Switch target translation language
  const handleChangeLanguage = async (langCode: string) => {
    setTargetLangCode(langCode);
    if (!currentDocument) return;

    setIsTranslating(true);

    // Immediate offline baseline
    const fastOffline = translateDocumentOffline(currentDocument.rawText, langCode);
    setTranslationData(fastOffline);

    // Asynchronous real translation
    try {
      const liveTranslation = await performTranslation(currentDocument.rawText, langCode);
      setTranslationData(liveTranslation);
    } catch (err) {
      console.warn('Live translation error, keeping offline translation:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubscribeSuccess = (plan: 'monthly' | 'annual') => {
    const updated = simulateGooglePlayPurchase(userAccount, plan);
    setUserAccount(updated);
    setIsPaywallOpen(false);
  };

  const handleResetQuota = () => {
    const reset = resetAccountToFreeTier();
    setUserAccount(reset);
  };

  return (
    <AndroidFrame
      userAccount={userAccount}
      onOpenCodeViewer={() => setIsCodeViewerOpen(true)}
      onOpenPaywall={() => {
        setPaywallTriggerContext(null);
        setIsPaywallOpen(true);
      }}
      onResetQuota={handleResetQuota}
      onBackGesture={() => setCurrentScreen('scanner')}
      canGoBack={currentScreen === 'processor'}
    >
      {currentScreen === 'scanner' ? (
        <ScannerScreen
          userAccount={userAccount}
          onDocumentScanned={handleDocumentScanned}
          onOpenPaywall={() => {
            setPaywallTriggerContext(null);
            setIsPaywallOpen(true);
          }}
        />
      ) : (
        currentDocument && (
          <ProcessorScreen
            document={currentDocument}
            simplifiedData={simplifiedData}
            translationData={translationData}
            currentMode={processingMode}
            userAccount={userAccount}
            isTranslating={isTranslating}
            onToggleMode={handleToggleMode}
            onSelectJargon={(term) => setSelectedJargon(term)}
            onBackToScanner={() => setCurrentScreen('scanner')}
            onOpenPaywall={() => {
              setPaywallTriggerContext(null);
              setIsPaywallOpen(true);
            }}
            onChangeLanguage={handleChangeLanguage}
          />
        )
      )}

      {/* Jargon Decoder Bottom Sheet Modal */}
      <JargonDecoderSheet
        term={selectedJargon}
        onClose={() => setSelectedJargon(null)}
      />

      {/* Premium Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        triggerContext={paywallTriggerContext}
        onClose={() => setIsPaywallOpen(false)}
        onSubscribeSuccess={handleSubscribeSuccess}
      />

      {/* Kotlin Jetpack Compose Code Inspector */}
      <KotlinCodeViewerModal
        isOpen={isCodeViewerOpen}
        onClose={() => setIsCodeViewerOpen(false)}
      />
    </AndroidFrame>
  );
}
