import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';
import { playHapticSound } from '../utils/audio.ts';

export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-5546661353360921~9323331918',
  adUnitId: 'ca-app-pub-5546661353360921/4705430057',
  publisherId: 'ca-app-pub-5546661353360921',
  slotId: '4705430057'
};

interface AdMobBannerProps {
  isPro?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
  position?: 'bottom' | 'inline';
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  isPro = false,
  onUpgradeClick,
  className = '',
  position = 'bottom'
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adDismissed, setAdDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const insRef = useRef<HTMLModElement>(null);

  // Pro users don't see ads!
  if (isPro || adDismissed) {
    return null;
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (win.adsbygoogle && insRef.current) {
          (win.adsbygoogle = win.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      }
    } catch (e) {
      console.log('AdMob web client note: running simulated/safe banner container in sandbox');
    }
  }, []);

  return (
    <div
      className={`w-full bg-[#0a0d13] border-t border-slate-800/90 flex flex-col items-center justify-center relative select-none shrink-0 ${className}`}
      data-admob-unit={ADMOB_CONFIG.adUnitId}
    >
      {/* Top micro-bar for AdMob compliance */}
      <div className="w-full px-3 py-0.5 flex items-center justify-between text-[9px] text-slate-500 bg-[#080a0f] border-b border-slate-900">
        <div className="flex items-center gap-1.5">
          <span className="bg-amber-500/20 text-amber-400 font-bold px-1 rounded uppercase tracking-wider text-[8px]">
            AD
          </span>
          <span className="text-slate-400 font-mono">Google AdMob</span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="hover:text-slate-300 transition-colors"
            title="AdMob Unit Information"
          >
            <Info className="w-2.5 h-2.5" />
          </button>
        </div>

        {onUpgradeClick && (
          <button
            onClick={() => {
              playHapticSound();
              onUpgradeClick();
            }}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
          >
            <Sparkles className="w-2.5 h-2.5 text-blue-400" />
            <span>Remove Ads</span>
          </button>
        )}
      </div>

      {/* Ad Unit Details Tooltip */}
      {showInfo && (
        <div className="w-full bg-slate-900/95 border-b border-slate-800 p-2 text-[10px] text-slate-300 flex items-center justify-between">
          <div className="truncate">
            <span className="text-slate-400">Unit ID: </span>
            <span className="font-mono text-emerald-400">{ADMOB_CONFIG.adUnitId}</span>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* AdMob Banner Canvas (320x50 Standard Mobile Banner / Responsive) */}
      <div className="w-full max-w-[360px] h-[52px] flex items-center justify-between px-3 py-1 overflow-hidden relative">
        {/* Real AdSense / AdMob Web Ad Container */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '50px' }}
          data-ad-client={ADMOB_CONFIG.publisherId}
          data-ad-slot={ADMOB_CONFIG.slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />

        {/* High-fidelity Fallback Display (visible when ads script is sandboxed or ad-blocked) */}
        <div className="absolute inset-0 flex items-center justify-between px-3 py-1 bg-gradient-to-r from-[#111722] via-[#161f30] to-[#111722] border-y border-blue-900/30">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
              Ad
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-200 truncate flex items-center gap-1.5">
                <span>Fast Document Scanner Pro</span>
                <span className="text-[9px] text-emerald-400 font-mono">★★★★★</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Official Google AdMob Sponsored Partner · Tap to explore
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-2 flex items-center gap-1">
            <a
              href="https://admob.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all"
            >
              Install
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
