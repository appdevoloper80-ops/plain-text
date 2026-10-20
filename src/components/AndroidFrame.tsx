import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Battery,
  Smartphone,
  Maximize2,
  Code2,
  RotateCcw,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import type { UserAccountState } from '../types.ts';
import { playHapticSound } from '../utils/audio.ts';

interface AndroidFrameProps {
  children: React.ReactNode;
  userAccount: UserAccountState;
  onOpenCodeViewer: () => void;
  onOpenPaywall: () => void;
  onResetQuota: () => void;
  onBackGesture?: () => void;
  canGoBack?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  userAccount,
  onOpenCodeViewer,
  onOpenPaywall,
  onResetQuota,
  onBackGesture,
  canGoBack = false
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
      {/* Top Header: Responsive Utility Bar */}
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
              <span>{userAccount.freeScansRemaining}/3 Left</span>
              <span className="text-blue-400 font-bold underline">Upgrade</span>
            </button>
          )}
        </div>

        {/* Quick Utility Controls */}
        <div className="flex items-center gap-1.5">
          {/* Kotlin Jetpack Compose Codebase Viewer */}
          <button
            onClick={() => {
              playHapticSound();
              onOpenCodeViewer();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 transition-all active:scale-95"
            title="Inspect Kotlin Jetpack Compose Code"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kotlin Code</span>
          </button>

          {/* Toggle Phone Mockup on Desktop */}
          {!isMobileScreen && (
            <button
              onClick={() => {
                playHapticSound();
                setIsPhoneFrameOnDesktop(!isPhoneFrameOnDesktop);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isPhoneFrameOnDesktop ? "Expand to Full Desktop View" : "Show Phone Frame"}
              aria-label="Toggle device frame"
            >
              {isPhoneFrameOnDesktop ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          )}

          {/* Reset Demo Quotas */}
          <button
            onClick={() => {
              playHapticSound();
              onResetQuota();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
            title="Reset Free Quota (Demo)"
            aria-label="Reset demo quota"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Container: Full-screen mobile on phones, centered canvas or phone frame on desktop */}
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
                <span className="text-[10px] text-emerald-400 font-bold uppercase">AI Vision</span>
                <Battery className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          )}

          {/* Core Interactive Screen */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* Bottom Bar: Back navigation if applicable */}
          {canGoBack && onBackGesture && (
            <div className="w-full py-1.5 px-4 bg-[#0e1217] border-t border-slate-900 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  playHapticSound();
                  onBackGesture();
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-800/60"
              >
                ◀ Back to Camera Scanner
              </button>
              <span className="text-[10px] text-slate-500 font-mono">PlainPrint Mobile</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
