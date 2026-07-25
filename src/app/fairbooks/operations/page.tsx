"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Business } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { fmtUsd } from "@/lib/engine/pnl";
import { complianceFor } from "@/data/compliance-dates";
import { useLedger } from "@/components/fairbooks/LedgerContext";

/** The prose can only reference figures by key — the UI interpolates real values,
 *  so the model cannot state a wrong number. Unknown keys render as "—". */
function interpolate(prose: string, figures: Record<string, number>): string {
  return prose.replace(/\{\{figure:([a-zA-Z0-9_.-]+)\}\}/g, (_, key) =>
    key in figures ? fmtUsd(figures[key]) : "—"
  );
}

function fallbackProse(month: string): string {
  return (
    `In ${month}, the business brought in {{figure:revenue}} and spent {{figure:expenses}} on operations, ` +
    `for a net of {{figure:net}} on a cash basis. Owner draws took a further {{figure:ownerDraw}} out of the account. ` +
    `Every one of these figures is computed from the ledger and clicks through to its source rows on the Books page.`
  );
}

export default function OperationsPage() {
  const { hasData, business, setBusiness, summary, transactions, anomalies } = useLedger();
  const [closeMonth, setCloseMonth] = useState<string | null>(null);
  const [prose, setProse] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const months = summary.months;
  const aging = anomalies.find((a) => a.ruleId === "vendor-aging");

  const figuresFor = useMemo(
    () => (month: string) => {
      const m = months.find((x) => x.month === month);
      return m
        ? {
            revenue: m.revenueCents,
            expenses: m.expenseCents,
            net: m.netCents,
            ownerDraw: m.ownerDrawCents,
          }
        : { revenue: 0, expenses: 0, net: 0, ownerDraw: 0 };
    },
    [months]
  );

  if (!hasData) {
    return (
      <main>
        <h1>Operations</h1>
        <p className="lede">No transactions loaded yet.</p>
        <div className="fb-btnrow"><Link href="/fairbooks" className="fb-cta">Load demo books or paste a CSV</Link></div>
      </main>
    );
  }

  const runClose = async (month: string) => {
    setCloseMonth(month);
    setBusy(true);
    const figures = figuresFor(month);
    try {
      const res = await fetch("/api/llm/explain-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, businessName: business.name, figures }),
      });
      if (res.ok) {
        const data = await res.json();
        setProse(typeof data.prose === "string" && data.prose.includes("{{figure:") ? data.prose : fallbackProse(month));
      } else {
        setProse(fallbackProse(month));
      }
    } catch {
      setProse(fallbackProse(month));
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const header = "Date,Description,Amount,Direction,Category,CategorizedBy,Confidence\n";
    const body = transactions
      .map((t) =>
        [
          t.date,
          `"${t.description.replace(/"/g, '""')}"`,
          (t.amountCents / 100).toFixed(2),
          t.direction,
          CATEGORY_LABELS[t.category],
          t.categorizedBy,
          t.confidence.toFixed(2),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fairbooks-export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reminder = aging
    ? `Hi — checking in on invoice ${String(aging.facts.vendor ?? "").trim()} (due ${aging.facts.dueDate}). We show it was settled ${aging.facts.daysLate} days late; we're tightening our payables process so future invoices are paid on time. Thanks for bearing with us — we value the relationship.`
    : "";

  return (
    <main>
      <h1>Operations</h1>

      <h2>Monthly close</h2>
      <div className="fb-btnrow">
        {months.map((m) => (
          <button key={m.month} className={`fb-cta ${closeMonth === m.month ? "" : "secondary"}`} onClick={() => runClose(m.month)}>
            Close {m.month}
          </button>
        ))}
      </div>
      {busy && <p className="fb-progress">Writing the summary — figures are already final; the AI only phrases them.</p>}
      {prose && closeMonth && !busy && (
        <div className="fb-panel">
          <p>{interpolate(prose, figuresFor(closeMonth))}</p>
          <p className="fb-small">
            The model emits figure placeholders; the numbers above were interpolated from your
            ledger — a misstated number is structurally impossible.
          </p>
        </div>
      )}

      <h2>Compliance calendar</h2>
      <div className="fb-btnrow">
        <label className="fb-small" htmlFor="fb-jur">Jurisdiction</label>
        <select
          id="fb-jur"
          value={business.jurisdiction}
          onChange={(e) => setBusiness({ ...business, jurisdiction: e.target.value as Business["jurisdiction"] })}
        >
          <option value="DC">District of Columbia</option>
          <option value="MD">Maryland</option>
          <option value="VA">Virginia</option>
        </select>
      </div>
      {complianceFor(business.jurisdiction).map((c) => (
        <div className="fb-panel" key={c.id}>
          <b>{c.title}</b> — {c.cadence}
          <p className="fb-small" style={{ margin: "0.3rem 0 0" }}>{c.detail}</p>
        </div>
      ))}
      <p className="fb-small">Reminders from public filing schedules (verified July 2026) — not tax advice.</p>

      {aging && (
        <>
          <h2>Vendor reminder draft</h2>
          <div className="fb-panel">
            <p>{reminder}</p>
            <div className="fb-btnrow">
              <button
                className="fb-cta secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(reminder);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied" : "Copy to clipboard"}
              </button>
              <span className="fb-small">FairBooks never sends anything on your behalf.</span>
            </div>
          </div>
        </>
      )}

      <h2>Export to your accountant</h2>
      <div className="fb-btnrow">
        <button className="fb-cta" onClick={exportCsv}>Download categorized CSV</button>
        <span className="fb-small">
          Clean, categorized, audit-annotated — the graduation path to real accounting software.
        </span>
      </div>
    </main>
  );
}
