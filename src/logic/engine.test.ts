import test from 'node:test';
import assert from 'node:assert/strict';
import { countWords, detectJargonTerms, processGeminiNanoOffline } from './jargonEngine.ts';
import { checkPaywallTrigger, recordSuccessfulScan, simulateGooglePlayPurchase } from './billingEngine.ts';
import { translateDocumentOffline } from './translationEngine.ts';
import { SAMPLE_DOCUMENTS } from './sampleDocuments.ts';

test('countWords accurately splits text into word count', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('Hello world'), 2);
  assert.equal(countWords('   Multiple   spaces   and\nlines   '), 4);
});

test('detectJargonTerms finds legal and medical terms', () => {
  const sampleText = 'Tenant shall indemnify Lessor and submit all disputes to binding mandatory arbitration.';
  const detected = detectJargonTerms(sampleText);
  const terms = detected.map(d => d.term);
  assert.ok(terms.includes('Indemnity / Hold Harmless'));
  assert.ok(terms.includes('Binding Mandatory Arbitration'));
});

test('processGeminiNanoOffline adheres to 6th-grade simplification and generates required sections', () => {
  const lease = SAMPLE_DOCUMENTS[0];
  const output = processGeminiNanoOffline(lease.rawText, lease.title);
  
  assert.equal(output.readingGrade, '6th Grade Level');
  assert.ok(output.readabilityScore >= 80);
  assert.ok(output.plainBullets.length > 0);
  assert.ok(output.hiddenRisks.length > 0);
  assert.ok(output.actionItems.length > 0);
  assert.ok(output.jargonTerms.length > 0);
});

test('checkPaywallTrigger triggers paywall when 3 scans run out', () => {
  const freeAccount = {
    isPro: false,
    freeScansRemaining: 0,
    totalScansCompleted: 3,
    monthlyResetDate: '2026-11-15T00:00:00Z'
  };

  const trigger = checkPaywallTrigger(freeAccount, 'simplify', 100);
  assert.ok(trigger !== null);
  assert.equal(trigger?.reason, 'quota_exhausted');
});

test('checkPaywallTrigger triggers paywall when document exceeds 200 words in Simplify Jargon mode', () => {
  const freeAccountWithScans = {
    isPro: false,
    freeScansRemaining: 2,
    totalScansCompleted: 1,
    monthlyResetDate: '2026-11-15T00:00:00Z'
  };

  // 150 words: passes
  const okTrigger = checkPaywallTrigger(freeAccountWithScans, 'simplify', 150);
  assert.equal(okTrigger, null);

  // 246 words in simplify: triggers word limit paywall
  const overTrigger = checkPaywallTrigger(freeAccountWithScans, 'simplify', 246);
  assert.ok(overTrigger !== null);
  assert.equal(overTrigger?.reason, 'word_limit_exceeded');

  // 246 words in translate mode: does NOT trigger word limit paywall
  const translateTrigger = checkPaywallTrigger(freeAccountWithScans, 'translate', 246);
  assert.equal(translateTrigger, null);
});

test('checkPaywallTrigger never blocks Pro subscribers', () => {
  const proAccount = {
    isPro: true,
    freeScansRemaining: 0,
    totalScansCompleted: 50,
    monthlyResetDate: '2026-11-15T00:00:00Z'
  };

  const trigger = checkPaywallTrigger(proAccount, 'simplify', 500);
  assert.equal(trigger, null);
});

test('recordSuccessfulScan decrements quota for free users only', () => {
  const freeAccount = {
    isPro: false,
    freeScansRemaining: 3,
    totalScansCompleted: 0,
    monthlyResetDate: '2026-11-15T00:00:00Z'
  };
  const updated = recordSuccessfulScan(freeAccount);
  assert.equal(updated.freeScansRemaining, 2);
  assert.equal(updated.totalScansCompleted, 1);
});

test('simulateGooglePlayPurchase upgrades account to Pro', () => {
  const freeAccount = {
    isPro: false,
    freeScansRemaining: 0,
    totalScansCompleted: 3,
    monthlyResetDate: '2026-11-15T00:00:00Z'
  };
  const proAccount = simulateGooglePlayPurchase(freeAccount, 'annual');
  assert.equal(proAccount.isPro, true);
  assert.equal(proAccount.activePlan, 'annual');
});

test('translateDocumentOffline produces valid translations in target languages', () => {
  const doc = SAMPLE_DOCUMENTS[0];
  const spanish = translateDocumentOffline(doc.rawText, 'es');
  assert.equal(spanish.targetLanguage, 'Spanish');
  assert.ok(spanish.translatedText.includes('ARRENDAMIENTO'));

  const hindi = translateDocumentOffline(doc.rawText, 'hi');
  assert.equal(hindi.targetLanguage, 'Hindi');
  assert.ok(hindi.translatedText.includes('किरायेदार'));

  // Test EULA translation in French & German
  const eula = SAMPLE_DOCUMENTS[1];
  const frenchEula = translateDocumentOffline(eula.rawText, 'fr');
  assert.equal(frenchEula.targetLanguage, 'French');
  assert.ok(frenchEula.translatedText.includes('CONTRAT DE LICENCE'));

  const germanEula = translateDocumentOffline(eula.rawText, 'de');
  assert.equal(germanEula.targetLanguage, 'German');
  assert.ok(germanEula.translatedText.includes('ENDNUTZER-LIZENZVEREINBARUNG'));

  // Test Surgical translation in Japanese
  const surgical = SAMPLE_DOCUMENTS[2];
  const japaneseSurgical = translateDocumentOffline(surgical.rawText, 'ja');
  assert.equal(japaneseSurgical.targetLanguage, 'Japanese');
  assert.ok(japaneseSurgical.translatedText.includes('腹腔鏡手術'));

  // Test Loan translation in Portuguese
  const loan = SAMPLE_DOCUMENTS[3];
  const ptLoan = translateDocumentOffline(loan.rawText, 'pt');
  assert.equal(ptLoan.targetLanguage, 'Portuguese');
  assert.ok(ptLoan.translatedText.includes('NOTA PROMISSÓRIA'));

  // Test custom arbitrary text translation
  const custom = translateDocumentOffline('This contract agreement assigns all tenant rights to landlord with security deposit.', 'es');
  assert.ok(custom.translatedText.includes('acuerdo') || custom.translatedText.includes('contrato') || custom.translatedText.includes('inquilino'));
});
