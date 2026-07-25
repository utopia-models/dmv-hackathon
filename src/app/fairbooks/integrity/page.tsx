"use client";

import Link from "next/link";
import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { RULE_COPY } from "@/lib/engine/anomalies";
import { fmtUsd } from "@/lib/engine/pnl";
import { useLedger } from "@/components/fairbooks/LedgerContext";
import ProvenanceDrawer from "@/components/fairbooks/ProvenanceDrawer";

function factLine(key: string, value: string | number): string {
  const label = key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
  if (/cents$/i.test(key) && typeof value === "number") return `${label.replace(/ ?[Cc]ents$/, "")}: ${fmtUsd(value)}`;
  return `${label}: ${value}`;
}

export default function IntegrityPage() {
  const { hasData, anomalies, score, transactions } = useLedger();
  const [drawer, setDrawer] = useState<{ title: string; txns: Transaction[] } | null>(null);

  if (!hasData) {
    return (
      <main>
        <h1>Integrity Report</h1>
        <p className="lede">No transactions loaded yet.</p>
        <div className="fb-btnrow"><Link href="/fairbooks" className="fb-cta">Load demo books or paste a CSV</Link></div>
      </main>
    );
  }

  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...anomalies].sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <main>
      <h1>Integrity Report</h1>
      <div className="fb-panel fb-score">
        <span className="ring" aria-label={`Integrity score ${score} out of 100`}>{score}</span>
        <div>
          <b>Integrity score</b>
          <p className="fb-small" style={{ margin: 0 }}>
            Deterministic rules over your ledger — same books, ethics lens. Every finding shows
            its evidence rows; the claim is never &quot;trust the AI.&quot;
          </p>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="fb-panel">
          <b>No findings.</b>
          <p className="fb-small">All six integrity rules ran clean on this ledger.</p>
        </div>
      )}

      {sorted.map((a) => {
        const copy = RULE_COPY[a.ruleId];
        const evidence = transactions.filter((t) => a.evidence.includes(t.id));
        return (
          <details key={a.id} className={`fb-panel fb-anomaly ${a.severity}`}>
            <summary>
              <span className={`fb-sev ${a.severity}`} aria-hidden />
              {copy.title}
              <span className="fb-small"> · {a.severity} · {evidence.length} evidence rows</span>
            </summary>
            <p className="why">{copy.why}</p>
            <ul>
              {Object.entries(a.facts).map(([k, v]) => (
                <li key={k} className="fb-small">{factLine(k, v)}</li>
              ))}
            </ul>
            {a.explanation && <p>{a.explanation}</p>}
            <div className="fb-btnrow">
              <button className="fb-cta secondary" onClick={() => setDrawer({ title: copy.title, txns: evidence })}>
                Show the {evidence.length} transactions
              </button>
            </div>
          </details>
        );
      })}

      {drawer && <ProvenanceDrawer title={drawer.title} txns={drawer.txns} onClose={() => setDrawer(null)} />}
    </main>
  );
}
