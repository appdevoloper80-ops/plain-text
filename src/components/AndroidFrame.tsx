import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize2,
  Code2,
  RotateCcw,
  Sparkles,
  Camera,
  Languages,
  BookOpen,
  HelpCircle,
  FileText
} from 'lucide-react';
import type { UserAccountState } from '../types.ts';
import { playHapticSound } from '../utils/audio.ts';
import { AdMobBanner } from './AdMobBanner.tsx';

interface AndroidFrameProps {
  children: React.ReactNode;
  userAccount: UserAccountState;
  currentTab: 'scanner' | 'processor';
  activeProcessorMode?: 'simplify' | 'translate';
  onSelectTab: (tab: 'scanner' | 'processor', mode?: 'simplify' | 'translate') => void;
  onOpenCodeViewer: () => void;
  onOpenPaywall: () => void;
  onResetQuota: () => void;
  onOpenGlossary: () => void;
  hasDocument: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  userAccount,
  currentTab,
  activeProcessorMode = 'simplify',
  onSelectTab,
  onOpenCodeViewer,
  onOpenPaywall,
  onResetQuota,
  onOpenGlossary,
  hasDocument
}) => {
  const [currentTime, setCurrentTime] = useState('10:42');
  const [isPhoneFrameOnDesktop, setIsPhoneFrameOnDesktop] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-dvh h-dvh w-full bg-[#07090d] text-slate-100 flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Top Header: Mobile-Optimized App Bar */}
      <header className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#0e1217] border-b border-slate-800/80 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
            P
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight">PlainPrint</span>
            <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-mono ml-2">
              ● Gemini Vision & Nano
            </span>
          </div>

          {/* Account Status Badge */}
          {userAccount.isPro ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm ml-1">
              <Sparkles className="w-2.5 h-2.5" /> PRO
            </span>
          ) : (
            <button
              onClick={() => {
                playHapticSound();
                onOpenPaywall();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors ml-1"
            >
              <span>{userAccount.freeScansRemaining} Free</span>
              <span className="text-blue-400 font-bold underline">Upgrade</span>
            </button>
          )}
        </div>

        {/* Quick Utility Controls */}
        <div className="flex items-center gap-1.5">
          {/* Kotlin Code Modal */}
          <button
            onClick={() => {
              playHapticSound();
              onOpenCodeViewer();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 transition-all active:scale-95"
            title="Inspect Kotlin Jetpack Compose Code & AdMob Setup"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kotlin Code</span>
          </button>

          {/* Desktop Frame Toggle */}
          {!isMobileScreen && (
            <button
              onClick={() => {
                playHapticSound();
                setIsPhoneFrameOnDesktop(!isPhoneFrameOnDesktop);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isPhoneFrameOnDesktop ? "Expand to Full View" : "Show Phone Frame"}
              aria-label="Toggle device frame"
            >
              {isPhoneFrameOnDesktop ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          )}

          {/* Reset Quota / Demo Toggle */}
          <button
            onClick={() => {
              playHapticSound();
              onResetQuota();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
            title="Reset Free Quota / Toggle Demo"
            aria-label="Reset demo quota"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main className="w-full flex-1 flex items-center justify-center overflow-hidden relative">
        <div
          className={`w-full h-full flex flex-col overflow-hidden transition-all duration-200 ${
            !isMobileScreen && isPhoneFrameOnDesktop
              ? 'max-w-[430px] max-h-[92vh] rounded-[36px] border-[8px] border-[#1e2430] shadow-2xl bg-[#0e1217] relative my-auto'
              : 'max-w-4xl bg-[#0e1217]'
          }`}
        >
          {/* Simulated Mobile Status Bar (Desktop Mockup only) */}
          {!isMobileScreen && isPhoneFrameOnDesktop && (
            <div className="w-full h-7 px-5 flex items-center justify-between text-xs text-slate-400 bg-[#0e1217] shrink-0 border-b border-slate-900">
              <span className="font-semibold text-[11px]">{currentTime}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">AI OCR</span>
                <span className="text-[10px] text-slate-500 font-mono">100%</span>
              </div>
            </div>
          )}

          {/* Core Screen */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* AdMob Banner (Shown to Free Users) */}
          {!userAccount.isPro && (
            <AdMobBanner
              isPro={userAccount.isPro}
              onUpgradeClick={onOpenPaywall}
              position="bottom"
            />
          )}

          {/* Mobile Bottom Navigation Bar (MD3 Tab Bar) */}
          <nav className="w-full py-1.5 px-3 bg-[#0a0d13] border-t border-slate-800/80 flex items-center justify-around shrink-0 z-30">
            {/* Scan Tab */}
            <button
              onClick={() => {
                playHapticSound();
                onSelectTab('scanner');
              }}
              className={`flex-1 py-1 flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                currentTab === 'scanner'
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl ${currentTab === 'scanner' ? 'bg-blue-600/20 text-blue-400' : ''}`}>
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Scan & OCR</span>
            </button>

            {/* Translate Tab */}
            <button
              onClick={() => {
                playHapticSound();
                if (hasDocument) {
                  onSelectTab('processor', 'translate');
                } else {
                  onSelectTab('scanner');
                }
              }}
              className={`flex-1 py-1 flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                currentTab === 'processor' && activeProcessorMode === 'translate'
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl ${currentTab === 'processor' && activeProcessorMode === 'translate' ? 'bg-blue-600/20 text-blue-400' : ''}`}>
                <Languages className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Translate</span>
            </button>

            {/* Simplify Tab */}
            <button
              onClick={() => {
                playHapticSound();
                if (hasDocument) {
                  onSelectTab('processor', 'simplify');
                } else {
                  onSelectTab('scanner');
                }
              }}
              className={`flex-1 py-1 flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                currentTab === 'processor' && activeProcessorMode === 'simplify'
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl ${currentTab === 'processor' && activeProcessorMode === 'simplify' ? 'bg-blue-600/20 text-blue-400' : ''}`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Simplify</span>
            </button>

            {/* Jargon Glossary Tab */}
            <button
              onClick={() => {
                playHapticSound();
                onOpenGlossary();
              }}
              className="flex-1 py-1 flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <div className="p-1 rounded-xl">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Glossary</span>
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
};
