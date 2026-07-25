// Client-side ledger persistence (localStorage). No server storage anywhere —
// "your financial data never leaves your browser except anonymized labels."

import type { AuditEntry, Business, Transaction } from "@/lib/types";

const KEY = "fairbooks.v1";

export type LedgerState = {
  business: Business;
  transactions: Transaction[];
  audit: AuditEntry[];
};

export const DEFAULT_BUSINESS: Business = { name: "Roost & Bean", jurisdiction: "VA" };

export function loadLedger(): LedgerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LedgerState) : null;
  } catch {
    return null;
  }
}

export function saveLedger(state: LedgerState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota/private mode — session continues in memory */
  }
}

export function clearLedger(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
