// Overrule — shared contract (namespaced; src/lib/types.ts belongs to FairBooks).
// Architecture rule: the facts come from tables; only the prose comes from the model.

export type CarcGroup = "CO" | "PR" | "OA" | "PI";

export type DenialCode = {
  code: string;
  type: "CARC" | "RARC";
  group?: CarcGroup;
  meaning: string;
  plainEnglish: string;
  appealable: "yes" | "sometimes" | "no";
  nextAction: string;
  category: string;
};

export type ExtractedClaim = {
  codes: string[];
  cpts: string[];
  icd10s: string[];
  amounts: { billed?: number; allowed?: number; patientOwes?: number };
  payer?: string;
  rawText: string;
};

export type Explanation = {
  summary: string;
  appealStrength: "strong" | "moderate" | "weak";
  reasons: string[];
};

export type AppealLetter = {
  patientName: string;
  payer: string;
  claimNumber: string;
  dateOfService: string;
  bodyParagraphs: string[];
};

export type Icd10Entry = { code: string; description: string; billable: boolean };

export const LLM_TIMEOUT_MS = 15_000;
export const LLM_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct";
