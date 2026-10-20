import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  X,
  ArrowRight,
  Clipboard,
  BookOpen
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../logic/sampleDocuments.ts';
import { countWords } from '../logic/jargonEngine.ts';
import { playHapticSound } from '../utils/audio.ts';

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, text: string) => void;
}

export const PasteTextModal: React.FC<PasteTextModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('Custom Document');

  if (!isOpen) return null;

  const words = countWords(text);

  const handlePasteClipboard = async () => {
    playHapticSound();
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setText(clipText);
          const firstLine = clipText.split('\n')[0]?.trim().slice(0, 36);
          if (firstLine && firstLine.length > 4) {
            setTitle(firstLine);
          }
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleLoadSample = (sampleText: string, sampleTitle: string) => {
    playHapticSound();
    setText(sampleText);
    setTitle(sampleTitle);
  };

  const handleProcess = () => {
    playHapticSound();
    if (!text.trim()) return;
    onSubmit(title || 'Document', text.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-[#141820] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0e1217]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Paste or Type Document</h3>
              <p className="text-[10px] text-slate-400">
                Direct text input for instant translation & plain English breakdown
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* Quick Paste from Clipboard button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste from Clipboard</span>
            </button>

            <span className="text-[11px] font-mono font-semibold text-slate-400">
              {words} words
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apartment Lease Agreement"
              className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Text Area */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Document Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type contract text, lease terms, medical consent, loan notice, or instructions here..."
              rows={7}
              className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-400" />
              <span>Or load a sample document:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleLoadSample(doc.rawText, doc.title)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  {doc.title.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1217] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              playHapticSound();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleProcess}
            disabled={!text.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process & Translate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
