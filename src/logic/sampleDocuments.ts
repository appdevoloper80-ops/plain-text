import type { DocumentData } from '../types.ts';

export const SAMPLE_DOCUMENTS: DocumentData[] = [
  {
    id: 'sample-lease-short',
    title: 'Apartment Lease Addendum (Security Deposit)',
    category: 'legal',
    wordCount: 128,
    capturedAt: '2026-10-16T10:30:00Z',
    source: 'sample',
    rawText: `RESIDENTIAL LEASE ADDENDUM: SECURITY DEPOSIT DISPOSITION & REPAIRS
The Lessee agrees that the security deposit of $1,850 shall be held in escrow by the Lessor. In the event of tenant vacating prior to the expiration of the tenancy term, the Lessee shall forfeit all rights to indemnity and reimbursement. The Lessor reserves the sole, unilateral discretion to deduct liquidated damages for wear, tear, repainting, and sanitization without itemized billing. 

The Lessee hereby covenants to indemnify and hold harmless the Lessor from all liability arising from latent structural defects. Any dispute shall be resolved via binding mandatory arbitration, waiving all rights to trial by jury or participation in class-action proceedings. Written notification of intent to terminate must be delivered 90 days prior via certified mail. Failure to deliver constitutes automatic renewal for an additional twelve months at prevailing market rent +15%.`
  },
  {
    id: 'sample-eula-long',
    title: 'Cloud Software EULA & Privacy Terms',
    category: 'technical',
    wordCount: 246,
    capturedAt: '2026-10-16T11:15:00Z',
    source: 'sample',
    rawText: `END-USER LICENSE AGREEMENT AND TELEMETRY PROVISION
By clicking accept, installing, or accessing the application, Licensee grants Licensor a perpetual, irrevocable, worldwide, royalty-free, transferable sublicensable license to capture, ingest, modify, synthesize, and monetize all ingested user inputs, biometric metadata, geolocation coordinates, and peripheral device logs for proprietary machine learning model training and commercial syndication with third-party advertising affiliates.

Licensor disclaims all express or implied warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. Under no circumstances shall Licensor be held liable for compensatory, punitive, consequential, or incidental damages resulting from security breaches, data corruption, or unauthorized credential exposure, even if advised of the possibility of such damages.

Licensee expressly waives any statutory right to contest liquidated penalty fees assessed against their recurring payment instrument. The Licensor reserves the unilateral prerogative to modify billing tariffs and tier structures without prior individual notice. Accounts inactive for sixty (60) days shall be summarily deleted without data repatriation or pro-rata subscription refunds.

All disputes arising hereunder shall be subject to the exclusive jurisdiction of the offshore courts of the Cayman Islands. Licensee agrees to reimburse Licensor for all reasonable attorney fees, forensic audit charges, and expert witness expenses incurred during enforcement proceedings. Severability: If any provision is deemed unenforceable, the remaining covenants remain in full force and effect.`
  },
  {
    id: 'sample-surgical-consent',
    title: 'Outpatient Surgical Procedure Consent',
    category: 'medical',
    wordCount: 165,
    capturedAt: '2026-10-16T12:00:00Z',
    source: 'sample',
    rawText: `INFORMED CONSENT FOR LAPAROSCOPIC INTERVENTION & ANESTHESIOLOGY
The patient acknowledges that the planned diagnostic laparoscopic ablation carries inherent risks including, but not limited to, hemorrhage requiring blood transfusion, unintended viscus perforation, thromboembolism, adverse anaphylactoid reaction to neuromuscular blockade agents, and nosocomial bacterial infection.

The attending surgeon reserves the authority to perform unanticipated ancillary surgical resection or convert to exploratory open laparotomy should intraoperative hemodynamic instability or occult anatomical anomalies arise. The patient certifies that they have maintained strict nil per os (NPO) status for twelve hours prior. Concurrent ingestion of antiplatelet compounds or anticoagulants not disclosed in pre-anesthetic clearance shall exonerate the hospital from clinical liability regarding hematoma or uncontrolled coagulopathy.

Prognosis cannot be guaranteed. Post-operative follow-up requires immediate presentation to triage if hyperpyrexia exceeding 38.5°C, intractable emesis, or peripheral edema occurs. The patient assigns all third-party health insurance reimbursements directly to the medical group and assumes personal joint and several liability for non-covered copays.`
  },
  {
    id: 'sample-auto-loan',
    title: 'Automotive Promissory Note & Chattel Mortgage',
    category: 'financial',
    wordCount: 218,
    capturedAt: '2026-10-16T13:45:00Z',
    source: 'sample',
    rawText: `PROMISSORY NOTE, SECURITY AGREEMENT, AND ACCELERATION COVENANT
For value received, the undersigned Borrower promises to pay to the order of Secured Party the principal sum of $24,500 with interest calculated on a 365-day simple daily basis at the default APR of 18.75%. Payment shall be rendered in sixty equal successive monthly installments.

Time is of the essence. Upon failure to remit any monthly payment within a grace period of five calendar days, the entire unpaid principal balance plus accrued late assessment charges of $75 per occurrence shall become immediately due and payable without demand or presentment (Acceleration Clause). The Secured Party retains a first-priority perfected purchase-money security interest in the subject collateral.

Borrower hereby grants Secured Party the right of immediate peaceful repossession without judicial process, including the activation of on-board telematics GPS tracking and remote ignition immobilization kill-switches. Borrower shall bear all towage, impound, reconditioning, and auction commission surcharges. In the event collateral liquidation yields a deficiency balance below the outstanding liability, Borrower shall remain strictly liable for the unsatisfied deficiency judgment. Subrogation rights are waived by Borrower. Amendments must be in writing.`
  }
];
