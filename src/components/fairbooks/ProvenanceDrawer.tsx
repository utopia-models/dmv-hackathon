"use client";

// The provenance drawer: any figure → its exact source transactions, each with the
// original CSV line, who categorized it (rule/llm/human) at what confidence, and an
// inline recategorize control that writes an audit entry. The AI itself is auditable.

import type { Category, Transaction } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { fmtUsd } from "@/lib/engine/pnl";
import { useLedger } from "./LedgerContext";

export default function ProvenanceDrawer({
  title,
  txns,
  onClose,
}: {
  title: string;
  txns: Transaction[];
  onClose: () => void;
}) {
  const { recategorize, audit } = useLedger();
  const relevantAudit = audit.filter((a) => txns.some((t) => t.id === a.txnId));

  return (
    <>
      <div className="fb-drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="fb-drawer" role="dialog" aria-label={`Source transactions: ${title}`}>
        <div className="fb-btnrow" style={{ justifyContent: "space-between", marginTop: 0 }}>
          <h3>{title}</h3>
          <button className="fb-cta secondary" onClick={onClose}>Close</button>
        </div>
        <p className="fb-small">
          {txns.length} source row{txns.length === 1 ? "" : "s"} ·{" "}
          {fmtUsd(txns.reduce((s, t) => s + (t.direction === "in" ? t.amountCents : -t.amountCents), 0))} net
        </p>
        <div className="fb-tablewrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th className="num">Amount</th><th>Category</th></tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>
                    {t.description}
                    <div className="raw">{t.rawRow}</div>
                  </td>
                  <td className="num">{t.direction === "out" ? "−" : ""}{fmtUsd(t.amountCents)}</td>
                  <td>
                    <span className={`fb-chip ${t.categorizedBy}`}>
                      {t.categorizedBy}{t.categorizedBy !== "human" ? ` ${Math.round(t.confidence * 100)}%` : ""}
                    </span>
                    <br />
                    <select
                      value={t.category}
                      onChange={(e) => recategorize(t.id, e.target.value as Category)}
                      aria-label={`Category for ${t.description}`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {relevantAudit.length > 0 && (
          <>
            <h3>Audit log</h3>
            <ul className="fb-audit">
              {relevantAudit.map((a, i) => (
                <li key={i}>
                  {a.at.slice(0, 19).replace("T", " ")} — {a.txnId}: {CATEGORY_LABELS[a.from]} →{" "}
                  {CATEGORY_LABELS[a.to]} (human)
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}
