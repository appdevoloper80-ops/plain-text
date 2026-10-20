import type { JargonDefinition } from '../types.ts';

export const JARGON_DICTIONARY: Record<string, JargonDefinition> = {
  'indemnify': {
    term: 'Indemnity / Hold Harmless',
    phonetic: 'in-DEM-nuh-fye',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'A promise where you pay for all damages, losses, or legal fees if someone else gets sued or hurt, even if it was partly their fault.',
    plainExample: 'If a visitor trips on the landlord’s loose porch stair, you (the tenant) might be forced to pay their medical bills and legal defense instead of the landlord.',
    counterTip: 'Ask to strike "hold harmless" or add "except in cases of gross negligence or intentional misconduct by the other party."'
  },
  'indemnification': {
    term: 'Indemnification',
    phonetic: 'in-dem-nuh-fuh-KAY-shun',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'A legal shield where one party makes you promise to pay all court costs and damages if trouble happens.',
    plainExample: 'If the software company gets sued for using copyrighted code, this clause could force you to pay for their lawyers.',
    counterTip: 'Never agree to unilateral indemnification; make sure protection is mutual or capped at the fee paid.'
  },
  'hold harmless': {
    term: 'Hold Harmless',
    phonetic: 'hohld HAHRM-liss',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'An agreement that you will not blame, sue, or demand money from the company or landlord even if their equipment causes damage.',
    plainExample: 'If water leaks through the ceiling from an old pipe and ruins your laptop, they don’t have to pay you anything.',
    counterTip: 'Add renter’s or personal insurance, and insist that landlord remains liable for structural safety.'
  },
  'binding mandatory arbitration': {
    term: 'Binding Mandatory Arbitration',
    phonetic: 'BYN-ding MAN-duh-tor-ee ahr-buh-TRAY-shun',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'Giving up your right to sue in an open public court with a judge and jury. Instead, a private paid arbitrator decides behind closed doors.',
    plainExample: 'If the company steals your deposit or defrauds you, you cannot take them to court or join with other victims.',
    counterTip: 'Check if there is a 30-day opt-out window via certified mail; many contracts legally allow opting out.'
  },
  'arbitration': {
    term: 'Arbitration',
    phonetic: 'ahr-buh-TRAY-shun',
    category: 'legal',
    riskLevel: 'medium',
    simpleDefinition: 'A private dispute hearing where a paid referee settles the fight instead of a public court judge.',
    plainExample: 'You and the company argue before a private referee whose ruling is final and almost impossible to appeal.',
    counterTip: 'Ensure the company pays the arbitration filing fees, which can otherwise cost thousands of dollars.'
  },
  'liquidated damages': {
    term: 'Liquidated Damages',
    phonetic: 'LIK-wih-day-tid DAM-ih-jiz',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'A pre-set cash penalty written into the contract that you must pay immediately if you break a rule, without them having to prove the actual loss.',
    plainExample: 'Moving out 2 days early could trigger a mandatory $2,000 fine even if a new renter moved in the next morning.',
    counterTip: 'Require the penalty to be tied to actual documented expenses rather than an arbitrary flat sum.'
  },
  'automatic renewal': {
    term: 'Automatic Renewal (Evergreen Clause)',
    phonetic: 'aw-tuh-MAT-ik ree-NOO-ul',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'A contract trap where your lease or subscription silently restarts for another full year if you don’t cancel in an exact narrow window.',
    plainExample: 'If you miss the 90-day warning deadline by even 1 day, you are locked into paying rent for another 12 months at higher rates.',
    counterTip: 'Set a phone calendar reminder 100 days before the contract ends to send written certified notice.'
  },
  'severability': {
    term: 'Severability',
    phonetic: 'sev-er-uh-BIL-ih-tee',
    category: 'legal',
    riskLevel: 'low',
    simpleDefinition: 'A standard safety rule meaning that if a court throws out one illegal sentence in this paper, all other parts remain active.',
    plainExample: 'If the $500 late fee is ruled illegal by a judge, you still have to pay regular rent and follow the rest of the lease.',
    counterTip: 'This is standard contract boilerplate and usually protects both sides from voiding the entire deal.'
  },
  'subrogation': {
    term: 'Subrogation (Waiver of Subrogation)',
    phonetic: 'sub-roh-GAY-shun',
    category: 'financial',
    riskLevel: 'medium',
    simpleDefinition: 'The right of an insurance company to step into your shoes and sue the party who caused your damage to recover paid money.',
    plainExample: 'When you waive subrogation, your insurer cannot go after the landlord or lender, and your insurance rates could rise.',
    counterTip: 'Verify with your insurance agent that your policy permits waivers of subrogation before signing.'
  },
  'acceleration clause': {
    term: 'Acceleration Clause',
    phonetic: 'ak-sel-er-AY-shun klawz',
    category: 'financial',
    riskLevel: 'critical',
    simpleDefinition: 'A loan trap where missing a single monthly payment by even a few days gives the bank the right to demand the ENTIRE loan paid in full right now.',
    plainExample: 'If you miss one $400 car payment by 5 days, the lender can demand you pay all remaining $24,500 immediately or forfeit the car.',
    counterTip: 'Negotiate a mandatory written 15-day cure notice period before acceleration can be declared.'
  },
  'deficiency judgment': {
    term: 'Deficiency Judgment',
    phonetic: 'dih-FISH-un-see JUHJ-munt',
    category: 'financial',
    riskLevel: 'critical',
    simpleDefinition: 'If the bank repossesses and auctions your property for less than what you owe, you still have to pay the leftover cash difference.',
    plainExample: 'You owe $20,000 on the car. The lender tows and auctions it for $12,000. You still owe them the remaining $8,000 plus fees.',
    counterTip: 'Try to negotiate "non-recourse" terms or maintain gap insurance coverage.'
  },
  'nil per os': {
    term: 'Nil Per Os (NPO)',
    phonetic: 'nil per AHS',
    category: 'medical',
    riskLevel: 'high',
    simpleDefinition: 'Latin medical order meaning "Nothing by mouth" - no water, food, mints, or medications allowed before anesthesia.',
    plainExample: 'Drinking even a sip of coffee with milk could cause stomach fluids to enter your lungs while asleep during surgery.',
    counterTip: 'Strictly stop all food and clear liquids according to the exact hours specified by your anesthesiologist.'
  },
  'npo': {
    term: 'NPO (Nothing by Mouth)',
    phonetic: 'en-pee-OH',
    category: 'medical',
    riskLevel: 'high',
    simpleDefinition: 'Strict medical command: no eating, drinking, or chewing anything by mouth before surgery.',
    plainExample: 'Taking a pill with water on surgery morning without clearance could cause your procedure to be canceled.',
    counterTip: 'Confirm with your nurse which daily morning pills (like blood pressure meds) are allowed with a tiny sip.'
  },
  'viscus perforation': {
    term: 'Viscus Perforation',
    phonetic: 'VISS-kus per-fuh-RAY-shun',
    category: 'medical',
    riskLevel: 'critical',
    simpleDefinition: 'An accidental puncture, tear, or hole poked through an internal organ (like the stomach, intestine, or bowel) during surgery.',
    plainExample: 'A surgical tool slips and punctures the colon wall, which requires an emergency bigger incision and antibiotics to fix.',
    counterTip: 'Ask the surgeon what safety cameras and laparoscopic tools they use to avoid internal tears.'
  },
  'thromboembolism': {
    term: 'Thromboembolism',
    phonetic: 'throm-boh-EM-buh-liz-um',
    category: 'medical',
    riskLevel: 'high',
    simpleDefinition: 'A dangerous blood clot that forms inside a vein (usually the calf) and breaks loose, traveling to your lungs or brain.',
    plainExample: 'Sitting immobile after surgery causes a leg clot that makes breathing painful and life-threatening.',
    counterTip: 'Wear the compression stockings and walk around as soon as the nurses encourage you to do so.'
  },
  'nosocomial': {
    term: 'Nosocomial Infection',
    phonetic: 'noh-soh-KOH-mee-ul',
    category: 'medical',
    riskLevel: 'medium',
    simpleDefinition: 'An infection or germ caught directly inside a hospital or clinic environment, often resistant to basic antibiotics.',
    plainExample: 'A post-op surgical site wound picking up MRSA bacteria while recovering in the hospital bed.',
    counterTip: 'Remind hospital staff and visitors to sanitize their hands before touching bandages or IV lines.'
  },
  'prognosis': {
    term: 'Prognosis',
    phonetic: 'prog-NOH-sis',
    category: 'medical',
    riskLevel: 'low',
    simpleDefinition: 'The doctor’s professional medical forecast or estimate of how your condition or recovery will turn out.',
    plainExample: 'A doctor stating "the prognosis is favorable" means you are likely to recover well after rest and therapy.',
    counterTip: 'Ask for specific recovery milestones (e.g., when can I drive, lift weights, or return to work?).'
  },
  'perpetual license': {
    term: 'Perpetual & Irrevocable License',
    phonetic: 'per-PECH-oo-ul LY-suns',
    category: 'technical',
    riskLevel: 'critical',
    simpleDefinition: 'Giving a software company forever rights to keep, sell, reuse, and feed your data into their computers, with no way to take it back.',
    plainExample: 'Even after you delete your app account, the company keeps your uploaded photos and voice clips forever to train AI models.',
    counterTip: 'Look for an opt-out toggle for "model training" in the app privacy settings or request data deletion under GDPR/CCPA.'
  },
  'remote ignition immobilization': {
    term: 'Remote Ignition Kill-Switch',
    phonetic: 'rih-MOHT ig-NISH-un',
    category: 'technical',
    riskLevel: 'critical',
    simpleDefinition: 'A wireless computer switch installed in your car that lets the lender shut off your engine remotely if you are late on a payment.',
    plainExample: 'Your car won’t start in your driveway for work because the lender detected a 4-day overdue payment balance.',
    counterTip: 'Inquire if your state prohibits remote starter interrupters without 48-hour prior emergency warning.'
  },
  'joint and several liability': {
    term: 'Joint and Several Liability',
    phonetic: 'joynt and SEV-er-ul ly-uh-BIL-ih-tee',
    category: 'legal',
    riskLevel: 'high',
    simpleDefinition: 'If two or more people sign together (like roommates or spouses), the company can force YOU alone to pay the full debt if the other person ghosts.',
    plainExample: 'If your roommate skips town and leaves unpaid rent, the landlord can legally seize the entire sum from your bank account alone.',
    counterTip: 'Avoid co-signing unless you are prepared to cover 100% of the financial burden yourself.'
  }
};
