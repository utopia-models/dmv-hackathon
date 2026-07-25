// Zod schemas for every LLM boundary. Strict: anything off-contract is rejected
// and the deterministic fallback takes over.

import { z } from "zod";
import { CATEGORIES, type Category } from "@/lib/types";

export const CategorySchema = z.enum(CATEGORIES as [Category, ...Category[]]);

export const CategorizeRequestSchema = z.object({
  rows: z
    .array(
      z.object({
        id: z.string().min(1),
        description: z.string().min(1),
        amountCents: z.number().int(),
        direction: z.enum(["in", "out"]),
      })
    )
    .min(1)
    .max(24),
});
export type CategorizeRequest = z.infer<typeof CategorizeRequestSchema>;

export const LabelSchema = z.object({
  id: z.string(),
  category: CategorySchema,
  counterparty: z.string().optional(),
  confidence: z.number().min(0).max(1),
});
export const CategorizeToolResultSchema = z.object({ labels: z.array(LabelSchema) });

export type CategorizeLabel = z.infer<typeof LabelSchema> & { categorizedBy: "llm" | "rule" };

export const ExplainMonthRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  businessName: z.string().min(1).max(120),
  figures: z.record(z.string(), z.number()),
});

export const ExplainAnomalyRequestSchema = z.object({
  ruleId: z.enum([
    "unrecorded-fulfillment-revenue",
    "price-variance",
    "commingling",
    "duplicate-charge",
    "vendor-aging",
    "round-number-cash",
  ]),
  facts: z.record(z.string(), z.union([z.string(), z.number()])),
});
