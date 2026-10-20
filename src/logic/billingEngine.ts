import type { UserAccountState, ProcessingMode, PaywallTriggerContext } from '../types.ts';

export const INITIAL_FREE_SCANS = 3;
export const WORD_LIMIT_THRESHOLD = 200;

export const SUBSCRIPTION_TIERS = {
  monthly: {
    id: 'plainprint_pro_monthly',
    name: 'Monthly Pass',
    priceInr: '₹399/month',
    priceUsd: '$4.99/mo',
    billingPeriod: 'Billed monthly',
    badge: null,
    savingsText: null
  },
  annual: {
    id: 'plainprint_pro_annual',
    name: 'Annual Pass',
    priceInr: '₹3,199/year',
    priceUsd: '$39.99/yr',
    billingPeriod: 'Billed annually ($3.33/mo)',
    badge: 'BEST VALUE',
    savingsText: 'Saves 33%'
  }
};

export const PRO_FEATURES = [
  {
    title: 'Unlimited Offline Scans',
    description: 'Process as many contracts, leases, and medical records as you need.'
  },
  {
    title: 'Deep Contract Trap Detection',
    description: 'Automatic red-flag warnings for hidden clauses, auto-renewals, and liability shifts.'
  },
  {
    title: 'Priority On-Device Model Speed',
    description: 'Optimized Gemini Nano quantization pipeline with sub-second inference.'
  },
  {
    title: 'Unlimited Language Packs',
    description: 'Offline bilingual conversion across 6 global languages without Wi-Fi or data.'
  }
];

const STORAGE_KEY = 'plainprint_account_state_v1';

/**
 * Loads user account state from localStorage or initializes default
 */
export function loadUserAccountState(): UserAccountState {
  if (typeof window === 'undefined') {
    return {
      isPro: false,
      freeScansRemaining: INITIAL_FREE_SCANS,
      totalScansCompleted: 0,
      monthlyResetDate: getNextResetDate()
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isPro: Boolean(parsed.isPro),
        freeScansRemaining: typeof parsed.freeScansRemaining === 'number' ? parsed.freeScansRemaining : INITIAL_FREE_SCANS,
        totalScansCompleted: typeof parsed.totalScansCompleted === 'number' ? parsed.totalScansCompleted : 0,
        monthlyResetDate: parsed.monthlyResetDate || getNextResetDate(),
        activePlan: parsed.activePlan
      };
    }
  } catch (err) {
    console.error('Error loading account state:', err);
  }

  const initial: UserAccountState = {
    isPro: false,
    freeScansRemaining: INITIAL_FREE_SCANS,
    totalScansCompleted: 0,
    monthlyResetDate: getNextResetDate()
  };
  saveUserAccountState(initial);
  return initial;
}

/**
 * Saves user account state to localStorage
 */
export function saveUserAccountState(state: UserAccountState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving account state:', err);
  }
}

/**
 * Generates ISO string for next monthly reset date
 */
function getNextResetDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

/**
 * Checks if paywall must be triggered according to business rules:
 * 1. User runs out of their 3 monthly free scans (<= 0)
 * 2. User toggles/uses "Simplify Jargon" mode on a document containing more than 200 words
 */
export function checkPaywallTrigger(
  account: UserAccountState,
  mode: ProcessingMode,
  wordCount: number
): PaywallTriggerContext | null {
  if (account.isPro) {
    return null; // Pro users never trigger paywall
  }

  // Check quota exhaustion
  if (account.freeScansRemaining <= 0) {
    return {
      reason: 'quota_exhausted',
      scansLeft: account.freeScansRemaining,
      wordCount
    };
  }

  // Check 200-word limit in Simplify Jargon mode
  if (mode === 'simplify' && wordCount > WORD_LIMIT_THRESHOLD) {
    return {
      reason: 'word_limit_exceeded',
      wordCount,
      scansLeft: account.freeScansRemaining
    };
  }

  return null;
}

/**
 * Deducts 1 scan if not Pro
 */
export function recordSuccessfulScan(account: UserAccountState): UserAccountState {
  if (account.isPro) {
    return {
      ...account,
      totalScansCompleted: account.totalScansCompleted + 1
    };
  }

  const updated: UserAccountState = {
    ...account,
    freeScansRemaining: Math.max(0, account.freeScansRemaining - 1),
    totalScansCompleted: account.totalScansCompleted + 1
  };
  saveUserAccountState(updated);
  return updated;
}

/**
 * Simulates purchase completion through Google Play Billing
 */
export function simulateGooglePlayPurchase(
  account: UserAccountState,
  plan: 'monthly' | 'annual'
): UserAccountState {
  const updated: UserAccountState = {
    ...account,
    isPro: true,
    activePlan: plan
  };
  saveUserAccountState(updated);
  return updated;
}

/**
 * Reset to free tier for demo & testing purposes
 */
export function resetAccountToFreeTier(): UserAccountState {
  const reset: UserAccountState = {
    isPro: false,
    freeScansRemaining: INITIAL_FREE_SCANS,
    totalScansCompleted: 0,
    monthlyResetDate: getNextResetDate(),
    activePlan: undefined
  };
  saveUserAccountState(reset);
  return reset;
}
