// POST /api/llm/explain-month — monthly-close prose whose numbers are
// {{figure:key}} placeholders ONLY. The UI interpolates real computed values,
// so the model literally cannot misstate a number. Off-contract prose (any raw
// numeral) → 1 retry → deterministic template.

import { NextResponse } from "next/server";
import { chatText } from "@/lib/llm/client";
import { ExplainMonthRequestSchema } from "@/lib/llm/schemas";

const PLACEHOLDER = /\{\{figure:([a-zA-Z0-9_.-]+)\}\}/g;

/** Drop assistant-style lead-ins ("Here is the monthly close note:") before the real prose. */
function stripPreamble(text: string): string {
  return text.replace(/^[^{]{0,80}:\s*\n+/, "").trim();
}

/** Valid prose: every placeholder key exists in figures, and there are no raw digits outside placeholders. */
function validateProse(prose: string, figures: Record<string, number>): boolean {
  const keys = [...prose.matchAll(PLACEHOLDER)].map((m) => m[1]);
  if (keys.some((k) => !(k in figures))) return false;
  const withoutPlaceholders = prose.replace(PLACEHOLDER, "");
  return !/\d/.test(withoutPlaceholders);
}

function templateProse(figures: Record<string, number>): string {
  const has = (k: string) => k in figures;
  const parts: string[] = [];
  parts.push(
    `This month the books show {{figure:revenue}} in revenue against {{figure:expenses}} in operating expenses, for a net of {{figure:net}}.`
  );
  if (has("cash")) parts.push(`Cash on hand at month end stands at {{figure:cash}}.`);
  if (has("ownerDraw") && figures.ownerDraw > 0)
    parts.push(`Owner draws this month totaled {{figure:ownerDraw}} — kept separate from operating expenses.`);
  if (has("uncategorizedCount") && figures.uncategorizedCount > 0)
    parts.push(
      `A small number of transactions remain uncategorized; review them in the books to keep the close accurate.`
    );
  parts.push(`Every figure above is computed directly from your categorized transactions and can be clicked through to its source rows.`);
  return parts.join(" ");
}

const SYSTEM = `You write a short, calm monthly-close note (4-6 sentences) for a small business owner with no accounting background.
HARD RULES:
- You may reference amounts ONLY as {{figure:key}} placeholders chosen from the provided key list. Example: "Revenue came in at {{figure:revenue}}."
- NEVER write any digit, number, dollar amount, percentage, or date numeral. Not one.
- Plain, encouraging, factual. No advice you cannot support from the figures. No exclamation marks.`;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = ExplainMonthRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", detail: parsed.error.issues }, { status: 400 });
  }
  const { month, businessName, figures } = parsed.data;

  const keyList = Object.keys(figures)
    .map((k) => `- ${k}`)
    .join("\n");
  const messages = [
    { role: "system" as const, content: SYSTEM },
    {
      role: "user" as const,
      content: `Business: ${businessName}. Month: ${month}.\nAvailable figure keys (use as {{figure:key}}):\n${keyList}\n\nWrite the monthly close note.`,
    },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const prose = await chatText({
      messages:
        attempt === 0
          ? messages
          : [
              ...messages,
              {
                role: "user" as const,
                content:
                  "Rewrite. Your previous note broke the rules (raw numeral or unknown figure key). Placeholders only, zero digits.",
              },
            ],
    });
    if (prose === null) break;
    const clean = stripPreamble(prose);
    if (validateProse(clean, figures)) {
      return NextResponse.json({ month, prose: clean, source: "llm" });
    }
  }

  return NextResponse.json({ month, prose: templateProse(figures), source: "template" });
}
