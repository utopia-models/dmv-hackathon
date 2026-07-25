// Client helpers for the LLM proxy routes (categorization is called directly by
// LedgerContext; these cover the prose routes). Every failure returns null —
// callers always have a deterministic fallback.

export async function explainMonthViaLlm(
  month: string,
  businessName: string,
  figures: Record<string, number>
): Promise<{ prose: string; source: string } | null> {
  try {
    const res = await fetch("/api/llm/explain-month", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, businessName, figures }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { prose?: string; source?: string };
    return typeof data.prose === "string" ? { prose: data.prose, source: data.source ?? "llm" } : null;
  } catch {
    return null;
  }
}

export async function explainAnomalyViaLlm(
  ruleId: string,
  facts: Record<string, string | number>
): Promise<string | null> {
  try {
    const res = await fetch("/api/llm/explain-anomaly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId, facts }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { explanation?: string };
    return typeof data.explanation === "string" ? data.explanation : null;
  } catch {
    return null;
  }
}

/** Local last-resort close note — used only if the explain-month API is unreachable.
 *  Same contract as the model: {{figure:key}} placeholders only, zero raw numerals. */
export function localCloseTemplate(figures: Record<string, number>): string {
  const parts = [
    "This month the books show {{figure:revenue}} in revenue against {{figure:expenses}} in operating expenses, for a net of {{figure:net}}.",
    "Cash on hand at month end stands at {{figure:cash}}.",
  ];
  if ((figures.ownerDraw ?? 0) > 0)
    parts.push("Owner draws this month totaled {{figure:ownerDraw}}, kept separate from operating expenses.");
  parts.push("Every figure above is computed from your categorized transactions and clicks through to its source rows.");
  return parts.join(" ");
}
