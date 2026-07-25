"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLedger } from "@/components/fairbooks/LedgerContext";

export default function FairbooksLanding() {
  const { loadDemo, ingestCsv } = useLedger();
  const router = useRouter();
  const [pasted, setPasted] = useState("");
  const [err, setErr] = useState("");

  const onDemo = () => {
    loadDemo();
    router.push("/fairbooks/books");
  };

  const onPaste = () => {
    const { count } = ingestCsv(pasted, "pasted-csv");
    if (!count) {
      setErr("Couldn't find date / description / amount columns in that text. Export a transactions CSV from your bank and paste the whole thing, header row included.");
      return;
    }
    router.push("/fairbooks/books");
  };

  return (
    <main>
      <h1>Books your business can trust — and prove.</h1>
      <p className="lede">
        The DMV runs on 1.66 million small businesses — 83% have no employees, and most run on a
        bank export and gut feel. U.S. Bank research found poor cash-flow management implicated
        in 82% of small-business failures. FairBooks is the clarity layer for the businesses
        below the accounting-software line: paste a messy CSV, get auditable books, an integrity
        report, and a monthly close in plain English.
      </p>

      <div className="fb-btnrow">
        <button className="fb-cta" onClick={onDemo}>Load demo books</button>
        <span className="fb-small">Roost &amp; Bean, a fictional Alexandria coffee roaster — modeled on the real books of a DMV small business we&apos;ve operated.</span>
      </div>

      <h2>Or paste your own transactions CSV</h2>
      <textarea
        value={pasted}
        onChange={(e) => { setPasted(e.target.value); setErr(""); }}
        placeholder={"Date,Description,Amount\n2026-06-01,SQUARE DEPOSIT,182.50\n2026-06-02,RENT,-1450.00"}
        aria-label="Paste transactions CSV"
      />
      {err && <p className="fb-small" role="alert" style={{ color: "var(--crit)" }}>{err}</p>}
      <div className="fb-btnrow">
        <button className="fb-cta secondary" onClick={onPaste} disabled={!pasted.trim()}>
          Build my books
        </button>
        <span className="fb-small">
          Parsing and every dollar of math run in your browser. The AI only suggests category
          labels — and the books work even if it&apos;s offline.
        </span>
      </div>

      <h2>What you get</h2>
      <div className="fb-panel">
        <ul>
          <li><b>Books</b> — cash-basis P&amp;L and cash flow where every figure clicks through to its source rows, with the categorizer&apos;s confidence shown and a logged human override.</li>
          <li><b>Integrity Report</b> — deterministic fairness rules: revenue collected but never booked, the same product at different prices, personal spending in business accounts, suppliers paid late, duplicate charges.</li>
          <li><b>Operations</b> — a one-click monthly close whose AI summary cannot misstate a number, DC/MD/VA filing reminders, and a clean export for the day you graduate to real accounting software.</li>
        </ul>
      </div>
      <p className="fb-small">Built at the DMV Hackathon, July 25, 2026.</p>
    </main>
  );
}
