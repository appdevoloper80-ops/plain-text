import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  FileText,
  ArrowRight,
  Edit3,
  X,
  Cpu
} from 'lucide-react';
import { countWords } from '../logic/jargonEngine.ts';
import { playHapticSound } from '../utils/audio.ts';

interface OcrProcessingModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  statusText: string;
  progress: number;
  previewImage?: string;
  extractedText: string;
  ocrSource?: string;
  error?: string;
  onConfirm: (text: string, title?: string) => void;
  onCancel: () => void;
  onRetry: () => void;
}

export const OcrProcessingModal: React.FC<OcrProcessingModalProps> = ({
  isOpen,
  isProcessing,
  statusText,
  progress,
  previewImage,
  extractedText,
  ocrSource,
  error,
  onConfirm,
  onCancel,
  onRetry
}) => {
  const [editedText, setEditedText] = useState(extractedText);
  const [docTitle, setDocTitle] = useState('Scanned Document');
  const [isEditing, setIsEditing] = useState(false);

  // Sync editedText when extractedText updates
  React.useEffect(() => {
    setEditedText(extractedText);
    if (extractedText.length > 0) {
      const firstLine = extractedText.split('\n')[0]?.trim().slice(0, 36);
      if (firstLine && firstLine.length > 4) {
        setDocTitle(firstLine);
      }
    }
  }, [extractedText]);

  if (!isOpen) return null;

  const currentWords = countWords(editedText);

  const handleProceed = () => {
    playHapticSound();
    if (!editedText.trim()) return;
    onConfirm(editedText.trim(), docTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-[#141820] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0e1217]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isProcessing ? 'Document OCR Scanning' : 'Review Extracted Document'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isProcessing
                  ? 'Optical Character Recognition in progress'
                  : `${currentWords} words detected · Ready to translate & simplify`}
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={() => {
                playHapticSound();
                onCancel();
              }}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* While OCR is processing */}
          {isProcessing ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              {/* Image Preview with scanning line animation */}
              {previewImage && (
                <div className="relative w-48 h-32 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-black">
                  <img
                    src={previewImage}
                    alt="Captured frame"
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* Glowing Laser Scan Bar */}
                  <div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse"
                    style={{
                      top: `${Math.min(95, Math.max(5, progress))}%`,
                      transition: 'top 0.4s ease-out'
                    }}
                  />
                </div>
              )}

              <div className="space-y-1.5 max-w-xs">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-white">
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  <span>{statusText || 'Extracting document text...'}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Progress: {progress}%
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>Hybrid: Gemini Vision + On-Device Neural Tesseract</span>
              </div>
            </div>
          ) : error || !editedText.trim() ? (
            /* Error or No Text Detected */
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No readable text found</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  {error || 'Make sure the camera is pointed clearly at paper text with adequate lighting, or paste your document directly below.'}
                </p>
              </div>

              {/* Paste or Type Fallback Option */}
              <div className="mt-4 text-left">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Type or Paste Document Text:
                </label>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Paste legal contract, rental lease, surgical consent, or medical instructions here..."
                  rows={4}
                  className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>
          ) : (
            /* Successful OCR Extraction Review */
            <div className="space-y-3">
              {/* Document Title input */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Extraction Source & Word Count Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="capitalize">{ocrSource || 'Optical Character Recognition'}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {currentWords} Words
                </span>
              </div>

              {/* Extracted Text Box (Editable) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">Extracted Document Text:</span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
                  </button>
                </div>

                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={isEditing ? 8 : 6}
                  className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-blue-500 font-sans resize-y"
                  placeholder="Scanned document text appears here..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1217] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              playHapticSound();
              onRetry();
            }}
            disabled={isProcessing}
            className="px-3 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>

          <button
            onClick={handleProceed}
            disabled={isProcessing || !editedText.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Proceed to Process & Translate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
