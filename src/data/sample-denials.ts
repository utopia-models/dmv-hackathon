// Three synthetic denial letters for the demo. All names, IDs, and payers are fictional.

export type SampleDenial = { id: string; title: string; blurb: string; text: string };

export const SAMPLE_DENIALS: SampleDenial[] = [
  {
    id: "medical-necessity",
    title: "“Not medically necessary”",
    blurb: "The classic CO-50 — one of the most frequently overturned denial types.",
    text: `POTOMAC HEALTH PLANS
EXPLANATION OF BENEFITS — THIS IS NOT A BILL

Member: Jordan Ellis          Member ID: PHP-4402913
Claim Number: 2026-183-55021  Date of Service: 06/12/2026
Provider: Arlington Internal Medicine Associates

Service: Office visit, established patient (99214)      Billed: $310.00
Service: Vitamin D; 25 hydroxy (82306)                  Billed: $86.00

Claim Status: DENIED
Amount Paid: $0.00            Patient Responsibility: $396.00

Reason Codes:
CO-50: These are non-covered services because this is not deemed a
medical necessity by the payer.
N115: This decision was based on a Local Coverage Determination (LCD).

If you disagree with this determination, you have the right to appeal
within 180 days of the date of this notice.`,
  },
  {
    id: "timely-filing",
    title: "“Filed too late”",
    blurb: "CO-29 — the provider's failure, and in most cases not your bill to pay.",
    text: `CHESAPEAKE MUTUAL INSURANCE
REMITTANCE ADVICE

Patient: Maria Okafor         Member ID: CMI-88120455
Claim: CM-2026-0071834        Date of Service: 01/08/2026
Provider: Fairfax Family Care

Service: Office visit, new patient (99203)              Billed: $245.00

Claim Status: DENIED
CO-29: The time limit for filing has expired.
MA130: Your claim contains incomplete and/or invalid information and
no appeal rights are afforded.

Amount Paid: $0.00`,
  },
  {
    id: "prior-auth",
    title: "“No prior authorization”",
    blurb: "CO-197 on a $1,840 MRI — retro-authorization appeals succeed regularly.",
    text: `CAPITAL AREA BENEFITS GROUP
EXPLANATION OF BENEFITS

Member: Sam Reyes             ID: CAB-2210087
Claim: 26-44510-D             Date of Service: 05/30/2026
Provider: Metro Imaging Center, Falls Church VA

Service: MRI lumbar spine w/o contrast (72148)          Billed: $1,840.00
Diagnosis: M54.16 (Radiculopathy, lumbar region)

Claim Status: DENIED
CO-197: Precertification/authorization/notification absent.
N286: Missing/incomplete/invalid referring provider primary identifier.

Amount Paid: $0.00            Patient Responsibility: $1,840.00`,
  },
];
