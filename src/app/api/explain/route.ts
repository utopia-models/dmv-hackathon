import { NextRequest, NextResponse } from "next/server";
import type { ExtractedClaim, Explanation } from "@/lib/types";
import { lookupDenialCode } from "@/data/carc-rarc";
import { llmJson } from "@/lib/llm";

export const maxDuration = 30;

/** Deterministic fallback: derive strength from the code table's appealable verdicts. */
function fallbackExplanation(claim: ExtractedClaim): Explanation {
  const entries = claim.codes
    .map((c) => ({ code: c, entry: lookupDenialCode(c) }))
    .filter((x) => x.entry);
  const yes = entries.filter((x) => x.entry!.appealable === "yes").length;
  const sometimes = entries.filter((x) => x.entry!.appealable === "sometimes").length;
  const appealStrength: Explanation["appealStrength"] =
    yes > 0 ? "strong" : sometimes > 0 ? "moderate" : "weak";
  const reasons = entries.map(
    (x) => `${x.code}: ${x.entry!.plainEnglish} Next step — ${x.entry!.nextAction}`
  );
  const summary = entries.length
    ? `Your claim was denied with ${entries.length} reason code${entries.length > 1 ? "s" : ""}. ${
        yes > 0
          ? "At least one of these denial types is commonly appealable — and appeals are decided in the patient's favor far more often than most people expect."
          : sometimes > 0
            ? "These codes are appealable in some situations — the details below explain when."
            : "These codes usually reflect cost-sharing or paperwork status rather than an appealable coverage decision — but the next steps below are still worth taking."
      }`
    : "No standard denial codes were detected. Use the manual code entry to add the codes printed on your letter.";
  return { summary, appealStrength, reasons };
}

function validate(parsed: unknown): Explanation | null {
  const p = parsed as Record<string, unknown>;
  if (
    typeof p?.summary === "string" &&
    (p?.appealStrength === "strong" || p?.appealStrength === "moderate" || p?.appealStrength === "weak") &&
    Array.isArray(p?.reasons) &&
    p.reasons.every((r) => typeof r === "string")
  ) {
    return { summary: p.summary, appealStrength: p.appealStrength, reasons: p.reasons as string[] };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { claim, context } = (await req.json()) as { claim: ExtractedClaim; context?: string };

  // Build the structured, deterministic view of the claim for the model —
  // the model never sees only raw text; it sees what the tables say.
  const decoded = claim.codes
    .map((c) => {
      const e = lookupDenialCode(c);
      return e
        ? `${c} — ${e.meaning}. Appealable: ${e.appealable}. Patient guidance: ${e.nextAction}`
        : `${c} — (not in table)`;
    })
    .join("\n");

  const system = `You are a careful assistant helping a patient understand a health-insurance claim denial. You are NOT a lawyer or clinician and you never give medical or legal advice. You explain, in plain, calm, encouraging language, what the denial codes mean for THIS claim and how strong an appeal looks. Ground every statement in the provided code table facts. Respond with JSON only: {"summary": string (<=120 words, second person), "appealStrength": "strong"|"moderate"|"weak", "reasons": string[] (2-5 short bullets, each tied to a specific code)}.`;

  const user = `Denial codes on the letter, with authoritative table facts:\n${decoded || "(none detected)"}\n\nCPT codes billed: ${claim.cpts.join(", ") || "none"}\nDiagnoses: ${claim.icd10s.join(", ") || "none"}\nAmounts: billed $${claim.amounts.billed ?? "?"}, patient owes $${claim.amounts.patientOwes ?? "?"}\nPayer: ${claim.payer ?? "unknown"}\n${context ? `Patient adds: ${context}` : ""}`;

  const result = await llmJson<Explanation>(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    validate
  );

  return NextResponse.json({
    explanation: result ?? fallbackExplanation(claim),
    source: result ? "llm" : "fallback",
  });
}
