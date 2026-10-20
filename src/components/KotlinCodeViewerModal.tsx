import React, { useState } from 'react';
import { X, Copy, Check, Code2, FileCode, ExternalLink } from 'lucide-react';
import { COMPOSE_SOURCE_FILES } from '../data/composeSourceCode.ts';
import { playHapticSound } from '../utils/audio.ts';

interface KotlinCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KotlinCodeViewerModal: React.FC<KotlinCodeViewerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = COMPOSE_SOURCE_FILES[selectedFileIdx];

  const handleCopy = () => {
    playHapticSound();
    navigator.clipboard.writeText(currentFile.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[88vh] bg-[#0e1217] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Kotlin Jetpack Compose Multi-File Codebase"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#141820]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                PlainPrint Native Android Architecture
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Jetpack Compose
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Single-Activity Architecture with Gemini Nano AICore & Material 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close code inspector"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-[#12161f] overflow-y-auto shrink-0 p-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-2 tracking-wider">
              Kotlin Source Files ({COMPOSE_SOURCE_FILES.length})
            </p>
            <div className="space-y-0.5">
              {COMPOSE_SOURCE_FILES.map((file, idx) => (
                <button
                  key={file.filename}
                  onClick={() => {
                    playHapticSound();
                    setSelectedFileIdx(idx);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    selectedFileIdx === idx
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{file.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Area */}
          <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-[#10141b] text-xs">
              <span className="font-mono text-slate-400 truncate max-w-md">
                {currentFile.path}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-[#131821] border-b border-slate-800/60">
              <p className="text-xs text-blue-300 font-medium">
                {currentFile.description}
              </p>
            </div>

            <pre className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-auto whitespace-pre leading-relaxed select-text">
              <code>{currentFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
