// P&L + cash-flow rollups. All integer-cents arithmetic; no floats until display.

import type { Category, Transaction } from "@/lib/types";

export type MonthlyRollup = {
  month: string; // "2026-04"
  revenueCents: number;
  expenseCents: number; // excludes owner.draw/contribution + transfer
  ownerDrawCents: number;
  netCents: number; // revenue - expenses
  byCategory: Partial<Record<Category, number>>; // signed by direction
};

const REVENUE: Category[] = ["revenue.sales", "revenue.shipping"];
const NON_OPERATING: Category[] = ["owner.draw", "owner.contribution", "transfer", "uncategorized"];

export function monthOf(t: Transaction): string {
  return t.date.slice(0, 7);
}

export function monthlyRollups(txns: Transaction[]): MonthlyRollup[] {
  const byMonth = new Map<string, Transaction[]>();
  for (const t of txns) {
    const m = monthOf(t);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(t);
  }
  const months = [...byMonth.keys()].sort();
  return months.map((month) => {
    const list = byMonth.get(month)!;
    let revenueCents = 0, expenseCents = 0, ownerDrawCents = 0;
    const byCategory: Partial<Record<Category, number>> = {};
    for (const t of list) {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amountCents;
      if (REVENUE.includes(t.category) && t.direction === "in") revenueCents += t.amountCents;
      else if (t.category === "owner.draw") ownerDrawCents += t.amountCents;
      else if (!NON_OPERATING.includes(t.category) && t.direction === "out") expenseCents += t.amountCents;
      else if (t.category === "uncategorized" && t.direction === "in") revenueCents += 0; // stays visible, not booked
    }
    return { month, revenueCents, expenseCents, ownerDrawCents, netCents: revenueCents - expenseCents, byCategory };
  });
}

export type CashPoint = { date: string; balanceCents: number };

/** Running cash balance (starting from 0 at the first transaction). */
export function cashSeries(txns: Transaction[]): CashPoint[] {
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
  let bal = 0;
  const points: CashPoint[] = [];
  for (const t of sorted) {
    bal += t.direction === "in" ? t.amountCents : -t.amountCents;
    if (points.length && points[points.length - 1].date === t.date) {
      points[points.length - 1].balanceCents = bal;
    } else {
      points.push({ date: t.date, balanceCents: bal });
    }
  }
  return points;
}

export function totals(txns: Transaction[]) {
  const roll = monthlyRollups(txns);
  return {
    revenueCents: roll.reduce((s, m) => s + m.revenueCents, 0),
    expenseCents: roll.reduce((s, m) => s + m.expenseCents, 0),
    netCents: roll.reduce((s, m) => s + m.netCents, 0),
    ownerDrawCents: roll.reduce((s, m) => s + m.ownerDrawCents, 0),
    months: roll,
  };
}

export function fmtUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
