import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Fingerprint,
  Zap,
  ArrowRight,
  Flame,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBSCRIPTION_TIERS, PRO_FEATURES } from '../logic/billingEngine.ts';
import type { PaywallTriggerContext } from '../types.ts';
import { playHapticSound, playSuccessChime } from '../utils/audio.ts';

interface PaywallModalProps {
  isOpen: boolean;
  triggerContext?: PaywallTriggerContext | null;
  onClose: () => void;
  onSubscribeSuccess: (plan: 'monthly' | 'annual') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  triggerContext,
  onClose,
  onSubscribeSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isProcessingPlayBilling, setIsProcessingPlayBilling] = useState(false);
  const [showPlaySheet, setShowPlaySheet] = useState(false);
  const [billingStep, setBillingStep] = useState<'review' | 'authenticating' | 'success'>('review');

  if (!isOpen) return null;

  const currentTier = SUBSCRIPTION_TIERS[selectedPlan];

  const handleStartCheckout = () => {
    playHapticSound();
    setShowPlaySheet(true);
    setBillingStep('review');
  };

  const handleConfirmPlayPurchase = () => {
    playHapticSound();
    setBillingStep('authenticating');
    setIsProcessingPlayBilling(true);

    setTimeout(() => {
      setBillingStep('success');
      setIsProcessingPlayBilling(false);
      playSuccessChime();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback
      }

      setTimeout(() => {
        onSubscribeSuccess(selectedPlan);
        setShowPlaySheet(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#12161f] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Unlock PlainPrint Pro"
      >
        {/* Top Glow & Close Button */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-600/20 via-blue-900/5 to-transparent pointer-events-none" />
        <button
          onClick={onClose}
          aria-label="Close paywall"
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-7">
          {/* Pro Icon & Headline */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25 mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Unlock PlainPrint Pro
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Private on-device AI for contracts, medical records & legal papers
            </p>

            {/* Context Trigger Reason Banner */}
            {triggerContext && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 text-left">
                {triggerContext.reason === 'word_limit_exceeded' ? (
                  <>
                    <FileText className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>
                      <strong>{triggerContext.wordCount} words:</strong> Large document simplification requires Pro
                    </span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>
                      You have used all <strong>3 free monthly scans</strong>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 mb-6 bg-[#161c26] border border-slate-800 rounded-2xl p-4">
            {PRO_FEATURES.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{feat.title}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Selection Radio Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Annual Pass Card */}
            <div
              onClick={() => {
                playHapticSound();
                setSelectedPlan('annual');
              }}
              className={`relative cursor-pointer rounded-2xl p-3.5 border transition-all ${
                selectedPlan === 'annual'
                  ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-[#161c26] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                Saves 33%
              </div>
              <p className="text-xs font-bold text-slate-200">Annual Pass</p>
              <div className="mt-1">
                <span className="text-lg font-black text-white">₹3,199</span>
                <span className="text-[11px] text-slate-400">/yr</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                $39.99/year · Best Value
              </p>
            </div>

            {/* Monthly Pass Card */}
            <div
              onClick={() => {
                playHapticSound();
                setSelectedPlan('monthly');
              }}
              className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-[#161c26] border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-xs font-bold text-slate-200">Monthly Pass</p>
              <div className="mt-1">
                <span className="text-lg font-black text-white">₹399</span>
                <span className="text-[11px] text-slate-400">/mo</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                $4.99/month · Flexible
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleStartCheckout}
            className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Subscribe Now</span>
            <span className="text-blue-200 font-normal text-xs">({currentTier.priceInr})</span>
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted Google Play Billing · Cancel anytime in Play Store</span>
          </p>
        </div>

        {/* Google Play Billing Simulated Bottom Sheet */}
        {showPlaySheet && (
          <div
            className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150"
            onClick={() => !isProcessingPlayBilling && setShowPlaySheet(false)}
          >
            <div
              className="w-full bg-[#181c24] border-t border-slate-700 rounded-t-3xl p-5 text-slate-100 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Play Store Drag bar */}
              <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-3" />

              {billingStep === 'review' && (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                        P
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Google Play</h4>
                        <p className="text-[11px] text-slate-400">PlainPrint Pro ({currentTier.name})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{currentTier.priceInr}</p>
                      <p className="text-[10px] text-slate-400">{currentTier.billingPeriod}</p>
                    </div>
                  </div>

                  <div className="bg-[#12161f] rounded-xl p-3 border border-slate-800 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">GPay · State Bank UPI</p>
                        <p className="text-[10px] text-slate-400">appdeveloper80@okaxis</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-blue-400 font-semibold cursor-pointer">Change</span>
                  </div>

                  <button
                    onClick={handleConfirmPlayPurchase}
                    className="w-full py-3 bg-[#01875f] hover:bg-[#017250] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>1-Tap Buy · Google Play</span>
                  </button>

                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    By tapping 1-Tap Buy, you authorize recurring charges via Google Play.
                  </p>
                </>
              )}

              {billingStep === 'authenticating' && (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-3 animate-pulse">
                    <Fingerprint className="w-6 h-6 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Verifying Biometrics...</h4>
                  <p className="text-xs text-slate-400 mt-1">Contacting Google Play Billing API</p>
                </div>
              )}

              {billingStep === 'success' && (
                <div className="py-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-3">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">Purchase Successful!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    PlainPrint Pro activated. Unlimited offline scans unlocked.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
