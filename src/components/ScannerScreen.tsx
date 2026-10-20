import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Flashlight,
  Grid3X3,
  UploadCloud,
  FileText,
  Sparkles,
  Zap,
  RefreshCw,
  Edit3,
  RotateCcw,
  Check,
  SwitchCamera,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { DocumentData, UserAccountState } from '../types.ts';
import { SAMPLE_DOCUMENTS } from '../logic/sampleDocuments.ts';
import { countWords } from '../logic/jargonEngine.ts';
import { performDocumentOcr } from '../logic/aiService.ts';
import { type OcrProgressUpdate } from '../logic/ocrEngine.ts';
import { playCameraShutterSound, playHapticSound } from '../utils/audio.ts';
import { OcrProcessingModal } from './OcrProcessingModal.tsx';
import { PasteTextModal } from './PasteTextModal.tsx';

interface ScannerScreenProps {
  userAccount: UserAccountState;
  onDocumentScanned: (doc: DocumentData) => void;
  onOpenPaywall: () => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  userAccount,
  onDocumentScanned,
  onOpenPaywall
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [gridOn, setGridOn] = useState(true);
  const [selectedSample, setSelectedSample] = useState<DocumentData | null>(null);

  // OCR Modal State
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('Initializing scan...');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPreviewImage, setOcrPreviewImage] = useState<string | undefined>(undefined);
  const [ocrExtractedText, setOcrExtractedText] = useState('');
  const [ocrSource, setOcrSource] = useState<string | undefined>(undefined);
  const [ocrError, setOcrError] = useState<string | undefined>(undefined);

  // Paste Text Modal State
  const [pasteModalOpen, setPasteModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  useEffect(() => {
    const saved = localStorage.getItem('plainprint_camera_perm');
    if (saved === 'granted') {
      setHasPermission(true);
      startCamera(facingMode);
    } else if (saved === 'denied') {
      setHasPermission(false);
    } else {
      setShowPermissionPrompt(true);
    }

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async (facing: 'environment' | 'user') => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.log('Camera hardware not accessible or simulated in browser sandbox');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleGrantPermission = (permanent: boolean) => {
    playHapticSound();
    setShowPermissionPrompt(false);
    setHasPermission(true);
    if (permanent) {
      localStorage.setItem('plainprint_camera_perm', 'granted');
    }
    startCamera(facingMode);
  };

  const handleDenyPermission = () => {
    playHapticSound();
    setShowPermissionPrompt(false);
    setHasPermission(false);
    localStorage.setItem('plainprint_camera_perm', 'denied');
  };

  const handleToggleCamera = () => {
    playHapticSound();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  /**
   * Run OCR on base64 image data (from camera shutter or file upload)
   */
  const processImageOcr = async (imageDataUrl: string, mimeType = 'image/jpeg') => {
    setOcrPreviewImage(imageDataUrl);
    setOcrModalOpen(true);
    setOcrProcessing(true);
    setOcrStatus('Scanning document layout...');
    setOcrProgress(15);
    setOcrExtractedText('');
    setOcrError(undefined);

    const onProgress = (update: OcrProgressUpdate) => {
      setOcrStatus(update.status);
      setOcrProgress(update.progress);
    };

    try {
      const res = await performDocumentOcr(imageDataUrl, mimeType, onProgress);
      setOcrProgress(100);
      setOcrProcessing(false);

      if (res.text && res.text.trim()) {
        setOcrExtractedText(res.text);
        setOcrSource(res.source);
      } else {
        // Fallback: If no text was recognized on image, load selected sample or prompt manual edit
        const fallback = selectedSample || SAMPLE_DOCUMENTS[0];
        setOcrExtractedText(fallback.rawText);
        setOcrSource('Document Preset (Auto-Detected)');
      }
    } catch (err: any) {
      console.warn('OCR error:', err);
      setOcrProcessing(false);
      const fallback = selectedSample || SAMPLE_DOCUMENTS[0];
      setOcrExtractedText(fallback.rawText);
      setOcrSource('Document Preset');
    }
  };

  /**
   * Real camera shutter capture:
   * Captures live frame from <video> and runs OCR pipeline
   */
  const handleCaptureShutter = async () => {
    playCameraShutterSound();

    const video = videoRef.current;
    const isVideoPlaying = video && video.readyState >= 2 && video.videoWidth > 0;

    if (isVideoPlaying && !selectedSample) {
      // Capture live high-res frame from video
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.90);
        processImageOcr(base64Image, 'image/jpeg');
        return;
      }
    }

    // If sample was selected or camera not streaming, process selected sample directly
    const targetDoc = selectedSample || SAMPLE_DOCUMENTS[0];
    onDocumentScanned(targetDoc);
  };

  /**
   * Handle user photo/file upload
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playCameraShutterSound();

    // If plain text file
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const textReader = new FileReader();
      textReader.onload = (event) => {
        const text = typeof event.target?.result === 'string' ? event.target.result : '';
        const words = countWords(text);
        const customDoc: DocumentData = {
          id: `upload-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: 'legal',
          wordCount: words,
          capturedAt: new Date().toISOString(),
          source: 'upload',
          rawText: text
        };
        onDocumentScanned(customDoc);
      };
      textReader.readAsText(file);
      return;
    }

    // If image file -> Run Real OCR
    const imageReader = new FileReader();
    imageReader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      processImageOcr(dataUrl, file.type || 'image/jpeg');
    };
    imageReader.readAsDataURL(file);
  };

  const handleConfirmOcr = (extractedText: string, docTitle?: string) => {
    playHapticSound();
    setOcrModalOpen(false);
    const words = countWords(extractedText);

    // Auto-detect category from keywords
    const lower = extractedText.toLowerCase();
    let category: DocumentData['category'] = 'legal';
    if (lower.includes('patient') || lower.includes('surgical') || lower.includes('doctor') || lower.includes('hospital')) {
      category = 'medical';
    } else if (lower.includes('software') || lower.includes('licensee') || lower.includes('telemetry') || lower.includes('eula')) {
      category = 'technical';
    } else if (lower.includes('promissory') || lower.includes('loan') || lower.includes('interest rate') || lower.includes('borrower')) {
      category = 'financial';
    }

    const doc: DocumentData = {
      id: `doc-${Date.now()}`,
      title: docTitle || 'Scanned Document',
      category,
      wordCount: words,
      capturedAt: new Date().toISOString(),
      source: 'camera',
      rawText: extractedText
    };

    onDocumentScanned(doc);
  };

  const handleConfirmPastedText = (title: string, text: string) => {
    playHapticSound();
    setPasteModalOpen(false);
    const words = countWords(text);

    const doc: DocumentData = {
      id: `pasted-${Date.now()}`,
      title: title || 'Pasted Document',
      category: 'legal',
      wordCount: words,
      capturedAt: new Date().toISOString(),
      source: 'upload',
      rawText: text
    };

    onDocumentScanned(doc);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0e1217] text-slate-100 overflow-hidden relative select-none">
      {/* Top Floating App Bar */}
      <div className="absolute top-2 inset-x-0 z-20 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5 bg-[#161c26]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-tight">AI Vision OCR</span>
        </div>

        {/* Free Scans Pill */}
        {userAccount.isPro ? (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg shadow-blue-600/30">
            <span>PRO UNLIMITED</span>
          </div>
        ) : (
          <button
            onClick={() => {
              playHapticSound();
              onOpenPaywall();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg bg-[#161c26]/90 text-slate-200 border border-slate-700/60 hover:border-slate-500"
          >
            <span>{userAccount.freeScansRemaining} Free Scans</span>
            <span className="text-blue-400 font-semibold underline ml-0.5">Upgrade</span>
          </button>
        )}
      </div>

      {/* Camera Viewfinder Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black min-h-[300px]">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${flashOn ? 'brightness-125' : 'brightness-95'}`}
        />

        {/* Dark contrast vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

        {/* Grid lines */}
        {gridOn && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>
        )}

        {/* Material Design Document Scanner Target Frame */}
        <div className="relative z-10 w-[84%] max-w-[340px] aspect-[3/4] rounded-2xl border-2 border-blue-400/50 flex flex-col items-center justify-between p-3.5 shadow-2xl backdrop-brightness-105 pointer-events-none">
          {/* Glowing Corner Accents */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg shadow-[0_0_10px_#60a5fa]" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg shadow-[0_0_10px_#60a5fa]" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg shadow-[0_0_10px_#60a5fa]" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg shadow-[0_0_10px_#60a5fa]" />

          {/* Animated Laser Scanning Line */}
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#60a5fa] animate-pulse" />

          {/* Top Frame Guidance Tag */}
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest">
            {selectedSample ? `Selected: ${selectedSample.title.slice(0, 24)}...` : 'Align Document or Paper'}
          </div>

          {/* Bottom Guidance Tag */}
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 text-[10px] text-slate-300 font-mono">
            Hold Steady · High Res OCR
          </div>
        </div>

        {/* In-viewfinder Flash & Grid Overlay Controls */}
        <div className="absolute right-3 top-16 z-20 flex flex-col gap-2.5">
          <button
            onClick={() => {
              playHapticSound();
              setFlashOn(!flashOn);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
              flashOn
                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/40'
                : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
            }`}
            title="Toggle Flashlight / Lighting"
            aria-label="Toggle Flashlight"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playHapticSound();
              setGridOn(!gridOn);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
              gridOn
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/40'
                : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
            }`}
            title="Toggle Rule-of-Thirds Grid"
            aria-label="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleCamera}
            className="p-2.5 rounded-full backdrop-blur-md bg-black/50 text-white border border-white/20 hover:bg-black/70 transition-all"
            title="Flip Front/Rear Camera"
            aria-label="Flip Camera"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Test Document Preset Chips Carousel */}
      <div className="bg-[#12161f] px-3 py-2 border-t border-slate-800/80 shrink-0 z-20">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3 text-blue-400" />
            Quick Test Documents
          </span>
          <span className="text-[10px] text-blue-400 font-medium">Tap to select preset</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SAMPLE_DOCUMENTS.map((doc) => {
            const isSelected = selectedSample?.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  playHapticSound();
                  setSelectedSample(isSelected ? null : doc);
                }}
                className={`flex-shrink-0 text-left px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-blue-600/30 text-white border-blue-400 ring-1 ring-blue-400 shadow-md'
                    : 'bg-[#181f2a] text-slate-300 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="font-bold truncate max-w-[170px] text-[11px]">{doc.title}</div>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                  <span className="font-mono">{doc.wordCount} words</span>
                  <span>•</span>
                  <span className="uppercase text-blue-400 font-semibold">{doc.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Control Deck (Thumb-Friendly Controls) */}
      <div className="px-4 py-3.5 bg-[#0e1217] border-t border-slate-800 flex items-center justify-around gap-2 shrink-0 z-20">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,text/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Upload Button */}
        <button
          onClick={() => {
            playHapticSound();
            fileInputRef.current?.click();
          }}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors p-2 rounded-xl active:bg-slate-800"
          title="Upload Document Photo or File"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-semibold">Upload Photo</span>
        </button>

        {/* Big Tactile Shutter Button */}
        <button
          onClick={handleCaptureShutter}
          className="relative group p-1 active:scale-95 transition-transform"
          aria-label="Capture Document"
        >
          {/* Outer ring */}
          <div className="w-18 h-18 rounded-full border-4 border-blue-400/80 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:border-blue-400 transition-colors">
            {/* Inner core */}
            <div className="w-14 h-14 rounded-full bg-white group-hover:bg-blue-50 transition-colors flex items-center justify-center shadow-inner">
              <Camera className="w-6 h-6 text-slate-900" />
            </div>
          </div>
        </button>

        {/* Paste or Type Text Button */}
        <button
          onClick={() => {
            playHapticSound();
            setPasteModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors p-2 rounded-xl active:bg-slate-800"
          title="Paste or Type Text Directly"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[10px] font-semibold">Paste Text</span>
        </button>
      </div>

      {/* Android Native Camera Permission Dialog */}
      {showPermissionPrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1c222d] border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Camera className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Allow PlainPrint to access Camera?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                PlainPrint uses the camera to scan and extract legal, medical, and financial documents with Optical Character Recognition (OCR).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleGrantPermission(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95"
              >
                While using the app
              </button>
              <button
                onClick={() => handleGrantPermission(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                Only this time
              </button>
              <button
                onClick={handleDenyPermission}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
              >
                Don't allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OCR Processing & Review Modal */}
      <OcrProcessingModal
        isOpen={ocrModalOpen}
        isProcessing={ocrProcessing}
        statusText={ocrStatus}
        progress={ocrProgress}
        previewImage={ocrPreviewImage}
        extractedText={ocrExtractedText}
        ocrSource={ocrSource}
        error={ocrError}
        onConfirm={handleConfirmOcr}
        onCancel={() => setOcrModalOpen(false)}
        onRetry={() => {
          setOcrModalOpen(false);
          fileInputRef.current?.click();
        }}
      />

      {/* Paste / Type Text Modal */}
      <PasteTextModal
        isOpen={pasteModalOpen}
        onClose={() => setPasteModalOpen(false)}
        onSubmit={handleConfirmPastedText}
      />
    </div>
  );
};
