import { NextRequest, NextResponse } from "next/server";
import type { AppealLetter, Explanation, ExtractedClaim } from "@/lib/overrule-types";
import { lookupDenialCode } from "@/data/carc-rarc";
import { buildFallbackParagraphs } from "@/lib/letter-template";
import { llmJson } from "@/lib/overrule-llm";

export const maxDuration = 30;

function validate(parsed: unknown): { bodyParagraphs: string[] } | null {
  const p = parsed as Record<string, unknown>;
  if (
    Array.isArray(p?.bodyParagraphs) &&
    p.bodyParagraphs.length >= 2 &&
    p.bodyParagraphs.every((x) => typeof x === "string")
  ) {
    return { bodyParagraphs: p.bodyParagraphs as string[] };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { claim, explanation, patient } = (await req.json()) as {
    claim: ExtractedClaim;
    explanation?: Explanation;
    patient?: Partial<AppealLetter>;
  };

  const decoded = claim.codes
    .map((c) => {
      const e = lookupDenialCode(c);
      return e ? `${c}: ${e.meaning} (appealable: ${e.appealable})` : c;
    })
    .join("\n");

  const system = `You write the body paragraphs of a formal patient appeal letter to a health insurer. Firm, professional, specific — never emotional, never threatening, no medical advice. Cite each denial code by name. Always: (1) state the appeal and request reprocessing, (2) address each code specifically and request the written clinical criteria or policy provision relied upon, (3) request the reviewer's credentials and any internal guideline, (4) invoke the right to internal appeal and, if upheld, external review under the Affordable Care Act. Use [BRACKETED PLACEHOLDERS] for facts you don't have. Respond with JSON only: {"bodyParagraphs": string[]} (3-6 paragraphs, no salutation, no signature).`;

  const user = `Denial codes with table facts:\n${decoded}\n\nCPTs: ${claim.cpts.join(", ") || "none"} · Diagnoses: ${claim.icd10s.join(", ") || "none"} · Billed: $${claim.amounts.billed ?? "?"} · Patient owes: $${claim.amounts.patientOwes ?? "?"}\nAppeal-strength assessment: ${explanation?.appealStrength ?? "unknown"} — ${explanation?.summary ?? ""}`;

  const result = await llmJson<{ bodyParagraphs: string[] }>(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    validate
  );

  const letter: AppealLetter = {
    patientName: patient?.patientName ?? "",
    payer: patient?.payer ?? claim.payer ?? "",
    claimNumber: patient?.claimNumber ?? "",
    dateOfService: patient?.dateOfService ?? "",
    bodyParagraphs: result?.bodyParagraphs ?? buildFallbackParagraphs(claim),
  };

  return NextResponse.json({ letter, source: result ? "llm" : "fallback" });
}
