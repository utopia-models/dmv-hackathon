"use client";

// The client-side ledger: single source of truth for every page.
// All arithmetic is deterministic; the LLM only labels (via /api/llm/categorize,
// silently skipped when unavailable) and writes prose. Never blocks on the LLM.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Anomaly, AuditEntry, Business, Category, Transaction } from "@/lib/types";
import { CATEGORIZE_BATCH_SIZE } from "@/lib/types";
import { parseCsv } from "@/lib/engine/csv";
import { toTransactions } from "@/lib/engine/normalize";
import { runIntegrityRules, integrityScore } from "@/lib/engine/anomalies";
import { totals } from "@/lib/engine/pnl";
import { DEFAULT_BUSINESS, loadLedger, saveLedger, clearLedger } from "@/lib/store";
import { SEED_CSV } from "@/data/roost-and-bean";

type LedgerApi = {
  business: Business;
  transactions: Transaction[];
  audit: AuditEntry[];
  anomalies: Anomaly[];
  score: number;
  summary: ReturnType<typeof totals>;
  llmBusy: boolean;
  llmLabeled: number;
  hasData: boolean;
  loadDemo: () => void;
  ingestCsv: (text: string, source: string) => { count: number; skipped: number };
  recategorize: (txnId: string, to: Category) => void;
  setBusiness: (b: Business) => void;
  reset: () => void;
};

const Ctx = createContext<LedgerApi | null>(null);

export function useLedger(): LedgerApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLedger outside provider");
  return v;
}

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusinessState] = useState<Business>(DEFAULT_BUSINESS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [llmBusy, setLlmBusy] = useState(false);
  const [llmLabeled, setLlmLabeled] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    const saved = loadLedger();
    if (saved) {
      setBusinessState(saved.business);
      setTransactions(saved.transactions);
      setAudit(saved.audit);
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (hydrated) saveLedger({ business, transactions, audit });
  }, [business, transactions, audit, hydrated]);

  /** Send low-confidence rows to the LLM in batches; silently keep rule labels on any failure. */
  const refineWithLlm = useCallback(async (txns: Transaction[]) => {
    const targets = txns.filter((t) => t.categorizedBy === "rule" && t.confidence < 0.8);
    if (!targets.length) return;
    setLlmBusy(true);
    setLlmLabeled(0);
    try {
      for (let i = 0; i < targets.length; i += CATEGORIZE_BATCH_SIZE) {
        const batch = targets.slice(i, i + CATEGORIZE_BATCH_SIZE);
        try {
          const res = await fetch("/api/llm/categorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rows: batch.map((t) => ({
                id: t.id,
                description: t.description,
                amountCents: t.amountCents,
                direction: t.direction,
              })),
            }),
          });
          if (!res.ok) continue; // route missing/erroring → rule labels stand
          const { labels } = await res.json();
          if (!Array.isArray(labels)) continue;
          setTransactions((prev) =>
            prev.map((t) => {
              const l = labels.find((x: { id: string }) => x.id === t.id);
              // A human label is never overwritten by the model.
              if (!l || t.categorizedBy === "human") return t;
              return { ...t, category: l.category, categorizedBy: "llm", confidence: l.confidence };
            })
          );
          setLlmLabeled((n) => n + batch.length);
        } catch {
          /* batch failed — deterministic labels stand */
        }
      }
    } finally {
      setLlmBusy(false);
    }
  }, []);

  const ingestCsv = useCallback(
    (text: string, source: string) => {
      const { rows, skipped } = parseCsv(text);
      const txns = toTransactions(rows, source);
      setTransactions(txns);
      setAudit([]);
      if (source !== "demo") void refineWithLlm(txns); // demo path is zero-LLM by design
      return { count: txns.length, skipped };
    },
    [refineWithLlm]
  );

  const loadDemo = useCallback(() => {
    ingestCsv(SEED_CSV, "demo");
    setBusinessState(DEFAULT_BUSINESS);
  }, [ingestCsv]);

  const recategorize = useCallback((txnId: string, to: Category) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== txnId || t.category === to) return t;
        setAudit((a) => [
          ...a,
          { txnId, at: new Date().toISOString(), from: t.category, to, by: "human" },
        ]);
        return { ...t, category: to, categorizedBy: "human", confidence: 1 };
      })
    );
  }, []);

  const anomalies = useMemo(() => runIntegrityRules(transactions), [transactions]);
  const score = useMemo(() => integrityScore(anomalies), [anomalies]);
  const summary = useMemo(() => totals(transactions), [transactions]);

  const api: LedgerApi = {
    business,
    transactions,
    audit,
    anomalies,
    score,
    summary,
    llmBusy,
    llmLabeled,
    hasData: transactions.length > 0,
    loadDemo,
    ingestCsv,
    recategorize,
    setBusiness: setBusinessState,
    reset: () => {
      setTransactions([]);
      setAudit([]);
      clearLedger();
    },
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
