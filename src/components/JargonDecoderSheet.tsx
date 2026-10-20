import React from 'react';
import { Volume2, ShieldAlert, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import type { JargonDefinition } from '../types.ts';
import { playHapticSound } from '../utils/audio.ts';

interface JargonDecoderSheetProps {
  term: JargonDefinition | null;
  onClose: () => void;
}

export const JargonDecoderSheet: React.FC<JargonDecoderSheetProps> = ({ term, onClose }) => {
  if (!term) return null;

  const handleSpeak = () => {
    playHapticSound();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(term.term);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getRiskBadge = () => {
    switch (term.riskLevel) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> High Trap Risk
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Caution Required
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
            <Info className="w-3.5 h-3.5" /> Notice
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Standard Clause
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#141820] border-t border-slate-700/80 rounded-t-3xl shadow-2xl p-6 pb-8 text-slate-100 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Jargon Decoder"
      >
        {/* Material 3 Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-600/70 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                {term.category} Jargon
              </span>
              {getRiskBadge()}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {term.term}
              <button
                onClick={handleSpeak}
                aria-label={`Pronounce ${term.term}`}
                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition-colors"
                title="Hear pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </h3>
            {term.phonetic && (
              <p className="text-xs font-mono text-slate-400 mt-0.5">{term.phonetic}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close decoder"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: 6th-Grade Plain English Definition */}
        <div className="mb-4 bg-[#1b222d] border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5">
            What it actually means (6th-Grade level)
          </p>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {term.simpleDefinition}
          </p>
        </div>

        {/* Section 2: Real-World Scenario */}
        <div className="mb-4 bg-[#1b222d] border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
            Real-Life Example
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {term.plainExample}
          </p>
        </div>

        {/* Section 3: Smart Counter-Advice */}
        <div className="mb-6 bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
            How to protect yourself
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">
            {term.counterTip}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            playHapticSound();
            onClose();
          }}
          className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-600 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          Got It, Continue Reading
        </button>
      </div>
    </div>
  );
};
