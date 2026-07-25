// FairBooks — shared contract. All arithmetic is deterministic TypeScript;
// the LLM only labels transactions (fixed enum, tool-calling) and writes prose.

export type Category =
  | "revenue.sales" | "revenue.shipping"
  | "cogs.inventory"
  | "expense.marketing" | "expense.software" | "expense.rent" | "expense.supplies"
  | "expense.professional" | "expense.taxes" | "expense.shipping"
  | "owner.draw" | "owner.contribution" | "transfer" | "uncategorized";

export type Transaction = {
  id: string; date: string; description: string;
  amountCents: number;                 // integers only — no float money
  direction: "in" | "out"; source: string;
  category: Category; categorizedBy: "rule" | "llm" | "human";
  confidence: number; rawRow: string;  // provenance: the original CSV line
};

export type AuditEntry = { txnId: string; at: string; from: Category; to: Category; by: "human" };

export type AnomalyRuleId =
  | "unrecorded-fulfillment-revenue" | "price-variance" | "commingling"
  | "duplicate-charge" | "vendor-aging" | "round-number-cash";

export type Anomaly = {
  id: string; ruleId: AnomalyRuleId; severity: "high" | "medium" | "low";
  evidence: string[];                  // txn ids
  facts: Record<string, string | number>;
  explanation?: string;                // optional LLM prose; anomaly renders without it
};

export type Business = { name: string; jurisdiction: "DC" | "MD" | "VA" };

export type MonthlySummary = {
  month: string; figures: Record<string, number>;
  prose: string;                       // contains {{figure:key}} placeholders ONLY
};

export const LLM_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct";
export const CATEGORIZE_BATCH_SIZE = 12;

export const CATEGORIES: Category[] = [
  "revenue.sales", "revenue.shipping",
  "cogs.inventory",
  "expense.marketing", "expense.software", "expense.rent", "expense.supplies",
  "expense.professional", "expense.taxes", "expense.shipping",
  "owner.draw", "owner.contribution", "transfer", "uncategorized",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  "revenue.sales": "Sales revenue",
  "revenue.shipping": "Shipping income",
  "cogs.inventory": "Inventory / COGS",
  "expense.marketing": "Marketing",
  "expense.software": "Software",
  "expense.rent": "Rent",
  "expense.supplies": "Supplies",
  "expense.professional": "Professional / payroll",
  "expense.taxes": "Taxes & fees",
  "expense.shipping": "Shipping & postage",
  "owner.draw": "Owner draw",
  "owner.contribution": "Owner contribution",
  "transfer": "Transfer",
  "uncategorized": "Uncategorized",
};
