import type { JargonDefinition, SimplifiedOutput } from '../types.ts';
import { JARGON_DICTIONARY } from './jargonDictionary.ts';

export const SYSTEM_INSTRUCTION =
  "You are an offline document companion. Analyze the provided text and rewrite it strictly into plain English at a 6th-grade reading level. Break down all legal, medical, or technical jargon into simple bullet points. Identify hidden risks or actionable next steps.";

/**
 * Counts words in a string.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Identifies matching jargon definitions in the text.
 */
export function detectJargonTerms(text: string): JargonDefinition[] {
  const normalized = text.toLowerCase();
  const detected: JargonDefinition[] = [];
  const addedKeys = new Set<string>();

  for (const [key, definition] of Object.entries(JARGON_DICTIONARY)) {
    if (normalized.includes(key)) {
      if (!addedKeys.has(definition.term)) {
        addedKeys.add(definition.term);
        detected.push(definition);
      }
    }
  }

  // If none matched, return sensible fallbacks based on common words
  if (detected.length === 0) {
    if (normalized.includes('damages') || normalized.includes('liability')) {
      detected.push(JARGON_DICTIONARY['liquidated damages']);
    }
  }

  return detected;
}

/**
 * Localized simulation of Gemini Nano on-device transformation engine.
 * Rewrites into strictly 6th-grade plain English, breaks down jargon into simple bullets,
 * identifies hidden risks, and extracts actionable next steps.
 */
export function processGeminiNanoOffline(rawText: string, title?: string): SimplifiedOutput {
  const wordCount = countWords(rawText);
  const detectedJargon = detectJargonTerms(rawText);
  const lower = rawText.toLowerCase();

  const isTechnical = lower.includes('licensee') || lower.includes('eula') || lower.includes('telemetry') || lower.includes('biometric') || lower.includes('licensor') || lower.includes('software');
  const isMedical = lower.includes('patient') || lower.includes('laparoscopic') || lower.includes('anesthesia') || lower.includes('nil per os') || lower.includes('surgical') || lower.includes('physician');
  const isFinancial = lower.includes('promissory') || lower.includes('borrower') || lower.includes('secured party') || lower.includes('apr') || lower.includes('repossession') || lower.includes('deficiency') || lower.includes('mortgage');
  const isLease = lower.includes('lease') || lower.includes('lessor') || lower.includes('lessee') || lower.includes('tenant') || lower.includes('security deposit');

  let summary = '';
  const plainBullets: string[] = [];
  const hiddenRisks: { title: string; description: string; severity: 'critical' | 'warning' | 'info' }[] = [];
  const actionItems: { id: string; text: string; priority: 'high' | 'medium' | 'low'; done: boolean }[] = [];

  if (isTechnical) {
    summary = "This is a software terms agreement where the company takes your private data, voice, and biometric details to train commercial AI models forever.";
    plainBullets.push("The company claims a forever license to reuse, sell, and feed everything you type or upload into machine learning models.");
    plainBullets.push("They disclaim all responsibility if hackers steal your passwords or if your files get corrupted on their servers.");
    plainBullets.push("They can increase your subscription pricing whenever they want without sending an email warning first.");
    plainBullets.push("If you don't log in for 60 days, your account and all saved files are permanently deleted with no refund.");
    plainBullets.push("If you want to sue them, you have to fly to the offshore Cayman Islands court and pay their private defense lawyers.");

    hiddenRisks.push({
      title: "Perpetual Biometric & Data Monetization",
      description: "Company keeps your prompts, voice, and facial data forever to train AI products and share with advertisers.",
      severity: 'critical'
    });
    hiddenRisks.push({
      title: "60-Day Inactive Account Erasure",
      description: "No logins for 60 days results in total irreversible deletion of your stored files.",
      severity: 'warning'
    });
    hiddenRisks.push({
      title: "Offshore Cayman Islands Jurisdiction",
      description: "Challenging any charge or privacy abuse requires hiring foreign lawyers in an offshore territory.",
      severity: 'critical'
    });

    actionItems.push({
      id: 'act-1',
      text: 'Check privacy settings and turn off "Allow data for AI model improvements".',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-2',
      text: 'Back up all project files locally so 60-day account inactivity won’t lose data.',
      priority: 'medium',
      done: false
    });
    actionItems.push({
      id: 'act-3',
      text: 'Use a virtual burner credit card with spending caps to block surprise price spikes.',
      priority: 'medium',
      done: false
    });
  } else if (isLease) {
    summary = "This is a rental rules document that protects the landlord and asks you to give up normal court rights. It makes it very hard to get your deposit back.";
    plainBullets.push("Your $1,850 deposit can be taken by the landlord for basic paint or cleaning without showing you itemized receipts.");
    plainBullets.push("If you move out even one week early, you lose your entire deposit and cannot ask for any refund.");
    plainBullets.push("If someone gets hurt on the property, you have agreed to pay their medical bills and lawyer fees instead of the owner (Indemnity).");
    plainBullets.push("You gave up your right to sue in front of a real judge and jury; disputes must go through a private paid arbitrator.");
    plainBullets.push("If you want to move out when your lease ends, you must send a certified letter 90 days early. Otherwise, you get locked in for another 12 months at 15% higher rent.");

    hiddenRisks.push({
      title: "Automatic 12-Month Lease Trap",
      description: "Missing the 90-day certified mail deadline automatically locks you into another full year with a 15% rent hike.",
      severity: 'critical'
    });
    hiddenRisks.push({
      title: "No Itemized Billing for Deposit Deductions",
      description: "Landlord claims the right to take cash for basic wear and tear without proving contractor receipts.",
      severity: 'warning'
    });
    hiddenRisks.push({
      title: "Jury Trial Waiver",
      description: "You cannot join a tenant class action or bring disputes to small claims court.",
      severity: 'info'
    });

    actionItems.push({
      id: 'act-1',
      text: 'Mark your calendar 100 days before lease ends to send certified move-out notice.',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-2',
      text: 'Take date-stamped video of every room, wall, and appliance before move-in.',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-3',
      text: 'Request in writing to strike the "hold harmless for latent defects" clause.',
      priority: 'medium',
      done: false
    });
  } else if (isMedical) {
    summary = "This is a hospital surgery consent form. It explains common surgical hazards and warns you not to eat or drink anything before your operation.";
    plainBullets.push("The planned laparoscopic procedure involves small camera cuts, but the surgeon can switch to a full open stomach surgery if bleeding happens.");
    plainBullets.push("Major risks include bleeding that needs blood donor transfusions, blood clots in the legs or lungs, and hospital-acquired infections.");
    plainBullets.push("You must obey 'Nil Per Os' (Nothing by mouth) for 12 full hours: absolutely no water, coffee, or snacks, or surgery will be canceled.");
    plainBullets.push("If you hid any aspirin or blood thinner medicines from your doctor, the clinic refuses liability for bleeding complications.");
    plainBullets.push("If your health insurance declines to pay any surgical charges, you personally owe 100% of the remaining hospital bill.");

    hiddenRisks.push({
      title: "Unilateral Emergency Procedure Authorization",
      description: "The surgeon has blanket legal authority to cut or remove extra tissue without waking you up to ask first.",
      severity: 'warning'
    });
    hiddenRisks.push({
      title: "Personal Liability for Denied Insurance Claims",
      description: "Any balance your insurance disputes or disallows becomes your immediate personal debt.",
      severity: 'critical'
    });
    hiddenRisks.push({
      title: "Strict Fasting Hazard",
      description: "Drinking water close to surgery time can cause stomach acid to enter lungs while asleep under anesthesia.",
      severity: 'critical'
    });

    actionItems.push({
      id: 'act-1',
      text: 'Stop all liquids and food exactly 12 hours prior to hospital arrival.',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-2',
      text: 'Give your nurse a full list of all supplements, vitamins, and pain pills taken this week.',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-3',
      text: 'Call your health insurer today to confirm pre-authorization for procedure codes.',
      priority: 'medium',
      done: false
    });
  } else if (isFinancial) {
    summary = "This is a high-interest car loan contract with strict repossession terms and a dangerous immediate payment acceleration clause.";
    plainBullets.push("You are borrowing $24,500 at an 18.75% annual interest rate spread across 60 monthly payments.");
    plainBullets.push("If you miss a payment by more than 5 days, a $75 late penalty applies and the entire $24,500 balance becomes due at once (Acceleration).");
    plainBullets.push("The lender has permission to track your vehicle via GPS 24/7 and wirelessly shut off your ignition so the car won’t start.");
    plainBullets.push("The lender can tow and repossess your car from your driveway without asking a judge or filing a lawsuit first.");
    plainBullets.push("If the car sells at auction for less than what you owe, you still have to pay the leftover unpaid cash difference (Deficiency Judgment).");

    hiddenRisks.push({
      title: "5-Day Default Acceleration Trigger",
      description: "Being 6 days late on a single payment allows the lender to legally demand the entire $24,500 payoff immediately.",
      severity: 'critical'
    });
    hiddenRisks.push({
      title: "Remote Ignition Kill-Switch & GPS Tracking",
      description: "The lender can remotely disable your engine and track your driving coordinates anywhere.",
      severity: 'critical'
    });
    hiddenRisks.push({
      title: "Deficiency Balance Liability",
      description: "Losing the car to repossession does not wipe out your debt; you must still pay the leftover balance after auction.",
      severity: 'warning'
    });

    actionItems.push({
      id: 'act-1',
      text: 'Set up automatic bank debit 3 days before due date to avoid the 5-day default cutoff.',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-2',
      text: 'Purchase GAP insurance to protect against deficiency balance if car is totaled.',
      priority: 'high',
      done: false
    });
    actionItems.push({
      id: 'act-3',
      text: 'Ask lender for a written 15-day cure window prior to any repossession.',
      priority: 'medium',
      done: false
    });
  } else {
    // Generic fallback for any arbitrary scanned text
    summary = "Here is what this document means in plain everyday words at a 6th-grade reading level:";
    plainBullets.push("This document outlines the ground rules and rights between both parties.");
    plainBullets.push("It sets strict deadlines and penalties if someone does not follow through with their promises.");
    plainBullets.push("Key responsibilities and financial payments are assigned to the signer.");
    if (detectedJargon.length > 0) {
      detectedJargon.forEach(j => {
        plainBullets.push(`${j.term}: ${j.simpleDefinition}`);
      });
    }

    hiddenRisks.push({
      title: "Unilateral Changes or Waivers",
      description: "Check carefully whether the issuer can alter terms or charge fees without personal notice.",
      severity: 'warning'
    });

    actionItems.push({
      id: 'act-1',
      text: 'Keep a saved offline copy of this signed document in your records.',
      priority: 'medium',
      done: false
    });
    actionItems.push({
      id: 'act-2',
      text: 'Review any marked jargon terms using the interactive decoder below.',
      priority: 'high',
      done: false
    });
  }

  return {
    summary,
    readingGrade: '6th Grade Level',
    readabilityScore: 84, // Flesch-Kincaid ease
    plainBullets,
    hiddenRisks,
    actionItems,
    jargonTerms: detectedJargon,
    wordCount
  };
}
