// POST /api/llm/explain-anomaly — optional "why it matters + what to do" prose
// for a finding. The finding itself renders from evidence rows + computed facts
// without this. Same no-numerals discipline; canned per-rule fallback.

import { NextResponse } from "next/server";
import type { AnomalyRuleId } from "@/lib/types";
import { chatText } from "@/lib/llm/client";
import { ExplainAnomalyRequestSchema } from "@/lib/llm/schemas";

const CANNED: Record<AnomalyRuleId, string> = {
  "unrecorded-fulfillment-revenue":
    "You are paying for postage, but no shipping income ever appears in the books. If customers pay for shipping at checkout, that money is arriving bundled into product deposits and going unbooked — which quietly understates revenue and overstates your shipping cost. Worth a look: book collected shipping as its own line so the books match what customers actually paid.",
  "price-variance":
    "The same item appears to sell at meaningfully different unit prices to different buyers. That can be intentional (volume discounts, relationships) — but if it isn't, it's margin quietly leaking. Worth a look: set a wholesale price list, and note agreed discounts on the invoice memo so the difference is documented.",
  commingling:
    "Some purchases in the business account look personal. Mixing personal and business spending is the single most common bookkeeping problem for small operators — it muddies your real margins and creates tax-time pain. Worth a look: move personal spending to a personal account, or record it as an owner draw the moment it happens.",
  "duplicate-charge":
    "The same vendor charged the same amount within a day or two. Sometimes that's legitimate (two identical orders) — often it's a billing error or a double-submitted payment. Worth a look: check the vendor invoice, and dispute the charge if it doesn't match.",
  "vendor-aging":
    "A supplier invoice was paid well after its stated due date. Late payments can strain the supplier relationships a small business depends on, and some vendors add late fees. Worth a look: a simple reminder a few days before each due date keeps this from recurring.",
  "round-number-cash":
    "Repeated identical round cash deposits stand out in any review of the books. They may be perfectly normal for a cash business — the point is documentation. Worth a look: keep a simple daily cash log (date, register total, deposit) so every deposit traces to recorded sales.",
};

const SYSTEM = `You explain a bookkeeping finding to a small business owner in 2-4 sentences: why it matters and one concrete next step.
HARD RULES:
- Never write any digit or amount — the UI already shows the exact evidence rows and computed facts.
- Neutral, never accusatory. "Worth a look" tone, not an alarm. The reader may simply have a good explanation.`;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = ExplainAnomalyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", detail: parsed.error.issues }, { status: 400 });
  }
  const { ruleId, facts } = parsed.data;

  const factList = Object.entries(facts)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  const messages = [
    { role: "system" as const, content: SYSTEM },
    {
      role: "user" as const,
      content: `Finding type: ${ruleId}\nComputed facts (context for you — do NOT restate the numbers):\n${factList}\n\nWrite the explanation.`,
    },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const prose = await chatText({
      messages:
        attempt === 0
          ? messages
          : [
              ...messages,
              { role: "user" as const, content: "Rewrite with zero digits and a neutral tone." },
            ],
    });
    if (prose === null) break;
    if (!/\d/.test(prose)) {
      return NextResponse.json({ ruleId, explanation: prose, source: "llm" });
    }
  }

  return NextResponse.json({ ruleId, explanation: CANNED[ruleId], source: "canned" });
}
