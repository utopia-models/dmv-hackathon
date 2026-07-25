// Deterministic extraction of denial/EOB structure from pasted text.
// Runs entirely client-side; zero network. This is the demo's backbone.

import type { ExtractedClaim } from "@/lib/overrule-types";

const CARC_RE = /\b(CO|PR|OA|PI)[\s-]?(\d{1,3}|B\d{1,2})\b/gi;
// RARC: N###, M##, MA### — require digits to avoid matching ordinary words
const RARC_RE = /\b(MA\d{2,3}|N\d{2,3}|M\d{2,3})\b/g;
// CPT: exactly 5 digits, commonly wrapped in parens in letters.
// Lookarounds reject digits glued to hyphens/digits — else claim-number segments
// like "2026-183-55021" leak in as phantom CPTs (caught in live QA).
const CPT_RE = /(?<![-\d])(\d{5})(?![-\d])/g;
// ICD-10-CM: letter + 2 digits, optional dot + up to 4 alphanumerics (e.g., M54.16, E11.9)
const ICD10_RE = /\b([A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4})?)\b/g;
const MONEY_RE = /\$\s?([\d,]+(?:\.\d{2})?)/g;

const BILLED_HINTS = /billed/i;
const ALLOWED_HINTS = /allowed/i;
const OWES_HINTS = /(patient\s+responsibility|you\s+owe|member\s+responsibility)/i;

/** First non-empty line that looks like a company header (all-ish caps, no digits-only). */
function guessPayer(text: string): string | undefined {
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (/^[A-Z][A-Z .,&'-]{4,60}$/.test(t) && !/EXPLANATION|REMITTANCE|BENEFITS|ADVICE|BILL/i.test(t)) {
      return t.replace(/\s+/g, " ");
    }
    // Only inspect the first few lines
    if (text.indexOf(line) > 200) break;
  }
  return undefined;
}

function toNumber(s: string): number {
  return parseFloat(s.replace(/,/g, ""));
}

export function extractClaim(rawText: string): ExtractedClaim {
  const codes = new Set<string>();
  const cpts = new Set<string>();
  const icd10s = new Set<string>();

  for (const m of rawText.matchAll(CARC_RE)) {
    codes.add(`${m[1].toUpperCase()}-${m[2].toUpperCase()}`);
  }
  for (const m of rawText.matchAll(RARC_RE)) codes.add(m[1].toUpperCase());
  for (const m of rawText.matchAll(CPT_RE)) cpts.add(m[1]);
  for (const m of rawText.matchAll(ICD10_RE)) {
    // Require a dot or a known-styled context to reduce false positives on bare A12 tokens
    if (m[1].includes(".")) icd10s.add(m[1].toUpperCase());
  }

  const amounts: ExtractedClaim["amounts"] = {};
  for (const line of rawText.split(/\r?\n/)) {
    const monies = [...line.matchAll(MONEY_RE)].map((m) => toNumber(m[1]));
    if (!monies.length) continue;
    if (OWES_HINTS.test(line)) amounts.patientOwes = monies[monies.length - 1];
    else if (ALLOWED_HINTS.test(line)) amounts.allowed = monies[monies.length - 1];
    else if (BILLED_HINTS.test(line)) {
      amounts.billed = (amounts.billed ?? 0) + monies[monies.length - 1];
    }
  }

  return {
    codes: [...codes],
    cpts: [...cpts],
    icd10s: [...icd10s],
    amounts,
    payer: guessPayer(rawText),
    rawText,
  };
}
