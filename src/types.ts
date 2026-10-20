export interface DocumentData {
  id: string;
  title: string;
  category: 'legal' | 'medical' | 'technical' | 'financial' | 'general';
  rawText: string;
  wordCount: number;
  capturedAt: string;
  source: 'camera' | 'upload' | 'sample';
  imageUri?: string;
}

export interface JargonDefinition {
  term: string;
  phonetic?: string;
  simpleDefinition: string;
  plainExample: string;
  category: 'legal' | 'medical' | 'technical' | 'financial';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  counterTip: string;
}

export interface SimplifiedOutput {
  summary: string;
  readingGrade: string; // e.g. "6th Grade Level"
  readabilityScore: number; // e.g. 84
  plainBullets: string[];
  hiddenRisks: {
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  actionItems: {
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
    done: boolean;
  }[];
  jargonTerms: JargonDefinition[];
  wordCount: number;
}

export interface TranslationOutput {
  targetLanguage: string;
  languageCode: string;
  nativeName: string;
  translatedText: string;
  confidence: number;
}

export type ProcessingMode = 'simplify' | 'translate';

export interface UserAccountState {
  isPro: boolean;
  freeScansRemaining: number; // default: 3
  totalScansCompleted: number;
  monthlyResetDate: string;
  activePlan?: 'monthly' | 'annual';
}

export interface PaywallTriggerContext {
  reason: 'quota_exhausted' | 'word_limit_exceeded';
  wordCount?: number;
  scansLeft: number;
}
