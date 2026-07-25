"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Transaction } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { cashSeries, fmtUsd } from "@/lib/engine/pnl";
import { useLedger } from "@/components/fairbooks/LedgerContext";
import { CashChart, MonthBars } from "@/components/fairbooks/Charts";
import ProvenanceDrawer from "@/components/fairbooks/ProvenanceDrawer";

type Drawer = { title: string; txns: Transaction[] } | null;

export default function BooksPage() {
  const { hasData, transactions, summary, llmBusy, llmLabeled } = useLedger();
  const [drawer, setDrawer] = useState<Drawer>(null);
  const cash = useMemo(() => cashSeries(transactions), [transactions]);

  if (!hasData) {
    return (
      <main>
        <h1>Books</h1>
        <p className="lede">No transactions loaded yet.</p>
        <div className="fb-btnrow"><Link href="/fairbooks" className="fb-cta">Load demo books or paste a CSV</Link></div>
      </main>
    );
  }

  const openCategory = (cat: Category) =>
    setDrawer({
      title: CATEGORY_LABELS[cat],
      txns: transactions.filter((t) => t.category === cat),
    });

  const revenueTxns = transactions.filter(
    (t) => (t.category === "revenue.sales" || t.category === "revenue.shipping") && t.direction === "in"
  );
  const expenseTxns = transactions.filter(
    (t) => t.direction === "out" && t.category.startsWith("expense")
  );
  const uncategorized = transactions.filter((t) => t.category === "uncategorized");

  // Category totals for the single-hue ranked bars
  const catTotals = Object.entries(
    transactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amountCents;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...catTotals.map(([, v]) => v));

  return (
    <main>
      <h1>Books</h1>
      <p className="fb-small">
        Every figure on this page is deterministic arithmetic over your rows — click any tile or
        line to see the exact source transactions.
        {llmBusy && <> · AI labeling in progress ({llmLabeled} rows refined; books already usable)</>}
      </p>

      <div className="fb-tiles">
        <button className="fb-tile" onClick={() => setDrawer({ title: "Revenue", txns: revenueTxns })}>
          <div className="n pos">{fmtUsd(summary.revenueCents)}</div>
          <div className="l">Revenue</div>
        </button>
        <button className="fb-tile" onClick={() => setDrawer({ title: "Operating expenses", txns: expenseTxns })}>
          <div className="n">{fmtUsd(summary.expenseCents)}</div>
          <div className="l">Operating expenses</div>
        </button>
        <button className="fb-tile" onClick={() => setDrawer({ title: "All transactions", txns: transactions })}>
          <div className={`n ${summary.netCents >= 0 ? "pos" : "neg"}`}>{fmtUsd(summary.netCents)}</div>
          <div className="l">Net (cash basis)</div>
        </button>
        <button className="fb-tile" onClick={() => setDrawer({ title: "Uncategorized", txns: uncategorized })}>
          <div className="n">{uncategorized.length}</div>
          <div className="l">Uncategorized rows</div>
        </button>
      </div>

      <MonthBars months={summary.months} />
      <CashChart points={cash} />

      <h2>By category</h2>
      <div className="fb-panel">
        {catTotals.map(([cat, cents]) => (
          <button
            key={cat}
            className="fb-tile"
            style={{ display: "block", width: "100%", border: "none", background: "transparent", padding: "0.35rem 0" }}
            onClick={() => openCategory(cat as Category)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <span style={{ width: "11rem", fontSize: "0.85rem", textAlign: "left", flexShrink: 0 }}>
                {CATEGORY_LABELS[cat as Category]}
              </span>
              <span
                aria-hidden
                style={{
                  height: 14,
                  width: `${Math.max(2, (cents / maxCat) * 100 * 0.6)}%`,
                  background: "var(--series-rev)",
                  opacity: cat.startsWith("revenue") ? 1 : 0.45,
                  borderRadius: 4,
                }}
              />
              <span className="fb-small" style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {fmtUsd(cents)}
              </span>
            </div>
          </button>
        ))}
        <p className="fb-small" style={{ marginTop: "0.6rem" }}>
          Bar length = gross dollars through the category (solid = revenue, faded = money out).
          Click a row for its source transactions.
        </p>
      </div>

      <h2>Monthly P&amp;L</h2>
      <div className="fb-panel fb-tablewrap">
        <table>
          <thead>
            <tr><th>Month</th><th className="num">Revenue</th><th className="num">Expenses</th><th className="num">Owner draws</th><th className="num">Net</th></tr>
          </thead>
          <tbody>
            {summary.months.map((m) => (
              <tr key={m.month} className="clickable"
                onClick={() => setDrawer({ title: m.month, txns: transactions.filter((t) => t.date.startsWith(m.month)) })}>
                <td>{m.month}</td>
                <td className="num">{fmtUsd(m.revenueCents)}</td>
                <td className="num">{fmtUsd(m.expenseCents)}</td>
                <td className="num">{fmtUsd(m.ownerDrawCents)}</td>
                <td className="num">{fmtUsd(m.netCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawer && <ProvenanceDrawer title={drawer.title} txns={drawer.txns} onClose={() => setDrawer(null)} />}
    </main>
  );
}
