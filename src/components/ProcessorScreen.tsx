import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Languages,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Columns
} from 'lucide-react';
import type {
  DocumentData,
  JargonDefinition,
  ProcessingMode,
  SimplifiedOutput,
  TranslationOutput,
  UserAccountState
} from '../types.ts';
import { SUPPORTED_LANGUAGES } from '../logic/translationEngine.ts';
import { playHapticSound } from '../utils/audio.ts';

interface ProcessorScreenProps {
  document: DocumentData;
  simplifiedData: SimplifiedOutput;
  translationData: TranslationOutput;
  currentMode: ProcessingMode;
  userAccount: UserAccountState;
  isTranslating?: boolean;
  onToggleMode: (mode: ProcessingMode) => void;
  onSelectJargon: (term: JargonDefinition) => void;
  onBackToScanner: () => void;
  onOpenPaywall: () => void;
  onChangeLanguage: (langCode: string) => void;
}

export const ProcessorScreen: React.FC<ProcessorScreenProps> = ({
  document,
  simplifiedData,
  translationData,
  currentMode,
  userAccount,
  isTranslating = false,
  onToggleMode,
  onSelectJargon,
  onBackToScanner,
  onOpenPaywall,
  onChangeLanguage
}) => {
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);
  const [localTranslating, setLocalTranslating] = useState(false);
  const [viewMode, setViewMode] = useState<'clean' | 'split'>('clean');

  const currentlyTranslating = isTranslating || localTranslating;

  const wordCount = document.wordCount;
  const isOver200Words = wordCount > 200;

  const handleToggleAction = (id: string) => {
    playHapticSound();
    setCheckedActions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyRaw = () => {
    playHapticSound();
    navigator.clipboard.writeText(document.rawText).then(() => {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    });
  };

  const handleCopyTranslation = () => {
    playHapticSound();
    navigator.clipboard.writeText(translationData.translatedText).then(() => {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    });
  };

  const handleSelectLanguage = (code: string) => {
    playHapticSound();
    setLocalTranslating(true);
    onChangeLanguage(code);
    setTimeout(() => {
      setLocalTranslating(false);
    }, 350);
  };

  const handleSpeakTranslation = () => {
    playHapticSound();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeakingTranslation) {
        window.speechSynthesis.cancel();
        setIsSpeakingTranslation(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translationData.translatedText);
      utterance.lang = translationData.languageCode;
      utterance.onend = () => setIsSpeakingTranslation(false);
      utterance.onerror = () => setIsSpeakingTranslation(false);
      setIsSpeakingTranslation(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0e1217] text-slate-100 overflow-hidden select-none">
      {/* Top App Bar */}
      <div className="px-4 py-2.5 bg-[#141820] border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20">
        <button
          onClick={() => {
            playHapticSound();
            onBackToScanner();
          }}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Back to Camera"
          aria-label="Back to Camera"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center truncate px-2 max-w-[200px]">
          <h2 className="text-xs font-bold text-white truncate">{document.title}</h2>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <span className="font-mono">{wordCount} words</span>
            <span>•</span>
            <span className="uppercase text-blue-400 font-bold">{document.category}</span>
          </div>
        </div>

        {/* Pro / Scans Badge */}
        {userAccount.isPro ? (
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            PRO
          </span>
        ) : (
          <button
            onClick={() => {
              playHapticSound();
              onOpenPaywall();
            }}
            className="text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/20 transition-colors"
          >
            {userAccount.freeScansRemaining} scans left
          </button>
        )}
      </div>

      {/* Two-Way Toggle Interface (Segmented MD3 Pill Bar) */}
      <div className="px-4 py-2.5 bg-[#12161f] border-b border-slate-800 shrink-0 z-20">
        <div className="bg-[#0b0e14] p-1 rounded-2xl flex items-center border border-slate-800 shadow-inner">
          {/* Simplify Jargon Button */}
          <button
            onClick={() => {
              playHapticSound();
              onToggleMode('simplify');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              currentMode === 'simplify'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Simplify Jargon</span>
            {isOver200Words && !userAccount.isPro && (
              <Lock className="w-3 h-3 text-amber-300 ml-0.5" />
            )}
          </button>

          {/* Translate Language Button */}
          <button
            onClick={() => {
              playHapticSound();
              onToggleMode('translate');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              currentMode === 'translate'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Translate Language</span>
          </button>
        </div>
      </div>

      {/* Processing Engine Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-left">
        {currentMode === 'simplify' ? (
          <>
            {/* System Engine Header Card */}
            <div className="bg-[#141a24] border border-blue-500/30 rounded-2xl p-3.5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Gemini Nano · 6th-Grade Engine
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold">
                  Score: {simplifiedData.readabilityScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {simplifiedData.summary}
              </p>
            </div>

            {/* Interactive Jargon Decoder Word Carousel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive Jargon Decoder
                </h3>
                <span className="text-[10px] text-blue-400 font-medium">
                  Tap word for plain meaning
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {simplifiedData.jargonTerms.map((jargon, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playHapticSound();
                      onSelectJargon(jargon);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1a212d] hover:bg-[#222b3a] active:scale-95 text-blue-300 border border-blue-500/40 shadow-sm transition-all"
                  >
                    <span>{jargon.term}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Plain English Bullet Points */}
            <div className="bg-[#141820] border border-slate-800 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Plain English Breakdown (No Legalese)
              </h3>
              <div className="space-y-2.5">
                {simplifiedData.plainBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Risks Detected */}
            <div className="bg-[#1c181f] border border-rose-900/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Hidden Traps & Contract Hazards ({simplifiedData.hiddenRisks.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {simplifiedData.hiddenRisks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="bg-[#151218] border border-rose-950/80 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-200">{risk.title}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {risk.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Next Steps Checklist */}
            <div className="bg-[#121b19] border border-emerald-900/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Actionable Next Steps (Checklist)
                </h3>
              </div>
              <div className="space-y-2">
                {simplifiedData.actionItems.map((item) => {
                  const isDone = Boolean(checkedActions[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleAction(item.id)}
                      className={`cursor-pointer flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-800/60 opacity-70'
                          : 'bg-[#101915] border-emerald-900/40 hover:border-emerald-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Translate Language View */
          <div className="space-y-4">
            {/* Target Language Selector */}
            <div className="bg-[#141820] border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Offline Target Language
                </label>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  100% On-Device
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = translationData.languageCode === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`py-2 px-2.5 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 ring-1 ring-blue-300'
                          : 'bg-[#1a202c] text-slate-300 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold">{lang.name}</p>
                      <p className="text-[10px] opacity-75">{lang.nativeName}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Translated Output Card */}
            <div className="bg-[#141820] border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">
                    Literal Translation · {translationData.targetLanguage} ({translationData.nativeName})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* View Mode Toggle: Clean vs Split */}
                  <button
                    onClick={() => {
                      playHapticSound();
                      setViewMode(viewMode === 'clean' ? 'split' : 'clean');
                    }}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                      viewMode === 'split'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title={viewMode === 'split' ? "Show Translation Only" : "Compare with Original English"}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden xs:inline">{viewMode === 'split' ? 'Split View' : 'Compare'}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyTranslation}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="Copy Translation"
                  >
                    {copiedTranslation ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Listen / TTS */}
                  <button
                    onClick={handleSpeakTranslation}
                    className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs ${
                      isSpeakingTranslation
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title="Listen to translation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">
                      {isSpeakingTranslation ? 'Stop' : 'Listen'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Translating Spinner State */}
              {currentlyTranslating ? (
                <div className="py-12 text-center bg-[#0b0e14] rounded-xl border border-slate-800/80">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">
                    Translating into {translationData.targetLanguage}...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Executing on-device Gemini Nano neural language model
                  </p>
                </div>
              ) : viewMode === 'split' ? (
                <div className="space-y-3">
                  <div className="bg-[#0b0e14] rounded-xl p-3 border border-blue-500/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                      {translationData.targetLanguage} Translation
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      {translationData.translatedText}
                    </p>
                  </div>

                  <div className="bg-[#0b0e14] rounded-xl p-3 border border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Original English Source
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {document.rawText}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b0e14] rounded-xl p-3 border border-slate-800/80">
                  <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line font-sans">
                    {translationData.translatedText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Original Extracted OCR Text */}
        <div className="bg-[#12161f] border border-slate-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => {
              playHapticSound();
              setShowRawOcr(!showRawOcr);
            }}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Original Extracted OCR Text ({wordCount} words)
            </span>
            {showRawOcr ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawOcr && (
            <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 bg-[#0d1017]">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCopyRaw}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                >
                  {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRaw ? 'Copied OCR' : 'Copy Text'}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-line bg-[#080b0f] p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                {document.rawText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
