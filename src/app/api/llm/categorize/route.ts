// POST /api/llm/categorize — label a batch of rows against the fixed Category enum
// via forced tool-calling. Strict zod validation → 1 retry → keyword fallback.
// This route never blocks the pipeline: a 200 with labels always comes back
// (unless the request itself is malformed).

import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/types";
import { keywordCategorize } from "@/lib/engine/rules";
import { chatToolCall, type ChatMessage, type ToolDef } from "@/lib/llm/client";
import {
  CategorizeRequestSchema,
  CategorizeToolResultSchema,
  type CategorizeLabel,
} from "@/lib/llm/schemas";

const TOOL: ToolDef = {
  type: "function",
  function: {
    name: "categorize_batch",
    description:
      "Assign every transaction row an accounting category from the fixed enum. Return one label per input id.",
    parameters: {
      type: "object",
      properties: {
        labels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              category: { type: "string", enum: CATEGORIES },
              counterparty: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["id", "category", "confidence"],
          },
        },
      },
      required: ["labels"],
    },
  },
};

const SYSTEM = `You label bank transactions for a tiny US business's cash-basis books.
Pick the best category for each row from the enum. Guidance:
- Sales/order deposits (Square, Shopify, Stripe, wholesale invoices) → revenue.sales
- Separately-collected shipping income → revenue.shipping
- Green coffee / raw inventory / packaging suppliers → cogs.inventory
- Postage & carriers (USPS, UPS, FedEx) → expense.shipping
- Personal-looking spend from the business account (games, vacations) → owner.draw
- Money moved between own accounts → transfer
- Genuinely unclear → uncategorized with low confidence. Never invent a category.`;

function fallbackLabels(rows: { id: string; description: string }[]): CategorizeLabel[] {
  return rows.map((r) => {
    const { category, confidence } = keywordCategorize(r.description);
    return { id: r.id, category, confidence, categorizedBy: "rule" as const };
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = CategorizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", detail: parsed.error.issues }, { status: 400 });
  }
  const { rows } = parsed.data;
  const wantIds = new Set(rows.map((r) => r.id));

  const user = rows
    .map(
      (r) =>
        `${r.id} | ${r.direction} | $${(r.amountCents / 100).toFixed(2)} | ${r.description}`
    )
    .join("\n");
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Label each row (id | direction | amount | description):\n${user}` },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await chatToolCall({
      messages:
        attempt === 0
          ? messages
          : [
              ...messages,
              {
                role: "user",
                content:
                  "Your previous answer was off-contract. Return the categorize_batch tool call again with EXACTLY one label per input id, category strictly from the enum.",
              },
            ],
      tool: TOOL,
    });
    if (raw === null) break; // no key / network / timeout — straight to fallback
    const result = CategorizeToolResultSchema.safeParse(raw);
    if (!result.success) continue;
    const byId = new Map(result.data.labels.filter((l) => wantIds.has(l.id)).map((l) => [l.id, l]));
    if (byId.size === 0) continue;
    // LLM labels where given; keyword fallback fills any ids the model missed.
    const labels: CategorizeLabel[] = rows.map((r) => {
      const l = byId.get(r.id);
      if (l) return { ...l, categorizedBy: "llm" as const };
      const { category, confidence } = keywordCategorize(r.description);
      return { id: r.id, category, confidence, categorizedBy: "rule" as const };
    });
    return NextResponse.json({ labels, source: "llm" });
  }

  return NextResponse.json({ labels: fallbackLabels(rows), source: "fallback" });
}
