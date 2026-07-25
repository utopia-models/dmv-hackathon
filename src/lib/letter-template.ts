// Deterministic appeal-letter skeleton. The LLM fills bodyParagraphs; if it can't,
// buildFallbackParagraphs produces a complete letter from the code table alone.

import type { AppealLetter, ExtractedClaim } from "@/lib/overrule-types";
import { lookupDenialCode } from "@/data/carc-rarc";

export function buildFallbackParagraphs(claim: ExtractedClaim): string[] {
  const paras: string[] = [];
  paras.push(
    `I am writing to formally appeal the denial of the claim referenced above. I request a full review of this determination and reprocessing of the claim.`
  );
  for (const code of claim.codes) {
    const entry = lookupDenialCode(code);
    if (!entry) continue;
    paras.push(
      `The Explanation of Benefits cites ${code} (“${entry.meaning}”). ${
        entry.appealable === "yes"
          ? `I dispute this determination and request that you provide, in writing, the specific clinical criteria, policy provisions, or coverage determinations relied upon in applying ${code} to this claim.`
          : `I request a written explanation of how ${code} was applied to this claim, including the specific plan provisions relied upon.`
      }`
    );
  }
  paras.push(
    `Please provide the credentials of the reviewer who made this determination and a copy of any internal guideline used. If additional documentation is required to process this appeal, notify me in writing within the timeframe required by my plan and applicable law.`
  );
  paras.push(
    `Under my plan and the Affordable Care Act, I am entitled to a full and fair review of this internal appeal, and to external review by an independent review organization should this denial be upheld. I expect a written decision within the timeframe required by law.`
  );
  return paras;
}

export function renderLetterText(letter: AppealLetter, claim: ExtractedClaim): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const enclosures = [
    "Copy of the Explanation of Benefits / denial notice",
    "Letter of medical necessity from my treating provider (if applicable)",
    "Relevant medical records supporting the services billed",
  ];
  return [
    `${today}`,
    ``,
    `${letter.payer || "[INSURANCE COMPANY NAME]"}`,
    `Appeals Department`,
    `[PAYER APPEALS ADDRESS — see the back of your EOB]`,
    ``,
    `Re: Formal Appeal of Claim Denial`,
    `Member: ${letter.patientName || "[YOUR NAME]"}`,
    `Claim Number: ${letter.claimNumber || "[CLAIM NUMBER]"}`,
    `Date of Service: ${letter.dateOfService || "[DATE OF SERVICE]"}`,
    claim.codes.length ? `Denial Code(s): ${claim.codes.join(", ")}` : ``,
    ``,
    `To Whom It May Concern:`,
    ``,
    letter.bodyParagraphs.join("\n\n"),
    ``,
    `Sincerely,`,
    ``,
    `${letter.patientName || "[YOUR NAME]"}`,
    `[PHONE] · [ADDRESS]`,
    ``,
    `Enclosures:`,
    ...enclosures.map((e) => `  • ${e}`),
  ]
    .filter((l) => l !== null)
    .join("\n");
}
