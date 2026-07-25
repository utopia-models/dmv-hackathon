// The Integrity Report engine — six deterministic fairness rules.
// Every finding carries evidence transaction ids + computed facts.
// The claim is always "here are the transactions," never "trust the AI."

import type { Anomaly, Transaction } from "@/lib/types";

let seq = 0;
function make(
  ruleId: Anomaly["ruleId"],
  severity: Anomaly["severity"],
  evidence: string[],
  facts: Anomaly["facts"]
): Anomaly {
  return { id: `a${seq++}`, ruleId, severity, evidence, facts };
}

/** 1 · Postage costs booked all period, shipping income never — likely unbooked collected revenue. */
function unrecordedFulfillmentRevenue(txns: Transaction[]): Anomaly | null {
  const postage = txns.filter((t) => t.category === "expense.shipping" && t.direction === "out");
  const shippingIncome = txns.filter((t) => t.category === "revenue.shipping" && t.direction === "in");
  if (postage.length < 3 || shippingIncome.length > 0) return null;
  const postageCents = postage.reduce((s, t) => s + t.amountCents, 0);
  const shippingMemos = txns.filter((t) => /\+\s?ship|incl\.?\s?ship|shipping/i.test(t.description) && t.direction === "in");
  return make("unrecorded-fulfillment-revenue", "high",
    [...postage.map((t) => t.id), ...shippingMemos.map((t) => t.id)],
    {
      shipmentsPaidFor: postage.length,
      postagePaidCents: postageCents,
      shippingIncomeRecordedCents: 0,
      orderMemosMentioningShipping: shippingMemos.length,
      minimumUnbookedEstimateCents: postageCents,
    });
}

/** 2 · Same item sold at materially different unit prices. */
function priceVariance(txns: Transaction[]): Anomaly | null {
  const groups = new Map<string, Transaction[]>();
  for (const t of txns) {
    if (t.direction !== "in") continue;
    const m = t.description.match(/—\s*(.+?)\s*x\s*\d+\s*$/i) ?? t.description.match(/-\s*(.+?)\s*x\s*\d+\s*$/i);
    if (!m) continue;
    const key = m[1].toUpperCase().replace(/\s+/g, " ");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  for (const [item, list] of groups) {
    if (list.length < 2) continue;
    const amts = list.map((t) => t.amountCents);
    const max = Math.max(...amts), min = Math.min(...amts);
    if (max >= min * 1.3) {
      return make("price-variance", "medium", list.map((t) => t.id), {
        item,
        occurrences: list.length,
        lowestCents: min,
        highestCents: max,
        spreadPct: Math.round(((max - min) / min) * 100),
      });
    }
  }
  return null;
}

/** 3 · Personal-looking spending in the business account. */
function commingling(txns: Transaction[]): Anomaly | null {
  const personal = txns.filter((t) => t.category === "owner.draw" && t.direction === "out");
  if (!personal.length) return null;
  const totalCents = personal.reduce((s, t) => s + t.amountCents, 0);
  return make("commingling", "medium", personal.map((t) => t.id), {
    transactions: personal.length,
    totalCents,
  });
}

/** 4 · Same vendor, same amount, same or adjacent day. */
function duplicateCharge(txns: Transaction[]): Anomaly | null {
  const outs = txns.filter((t) => t.direction === "out");
  for (let i = 0; i < outs.length; i++) {
    for (let j = i + 1; j < outs.length; j++) {
      const a = outs[i], b = outs[j];
      if (a.description === b.description && a.amountCents === b.amountCents) {
        const dayDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / 86400000;
        if (dayDiff <= 1) {
          return make("duplicate-charge", "high", [a.id, b.id], {
            vendor: a.description,
            amountCents: a.amountCents,
            dates: `${a.date} & ${b.date}`,
          });
        }
      }
    }
  }
  return null;
}

/** 5 · Invoice memo carries a due date paid 30+ days late. */
function vendorAging(txns: Transaction[]): Anomaly | null {
  for (const t of txns) {
    if (t.direction !== "out") continue;
    const m = t.description.match(/due\s+(\d{1,2})\/(\d{1,2})/i);
    if (!m) continue;
    const year = t.date.slice(0, 4);
    const due = new Date(`${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`);
    const paid = new Date(t.date);
    const daysLate = Math.round((paid.getTime() - due.getTime()) / 86400000);
    if (daysLate >= 30) {
      return make("vendor-aging", "medium", [t.id], {
        vendor: t.description.split(" INV-")[0],
        daysLate,
        amountCents: t.amountCents,
        dueDate: due.toISOString().slice(0, 10),
        paidDate: t.date,
      });
    }
  }
  return null;
}

/** 6 · Repeated identical round-number cash deposits — documentation flag, phrased neutrally. */
function roundNumberCash(txns: Transaction[]): Anomaly | null {
  const cash = txns.filter(
    (t) => /CASH/i.test(t.description) && t.direction === "in" && t.amountCents % 10000 === 0
  );
  const byAmount = new Map<number, Transaction[]>();
  for (const t of cash) {
    if (!byAmount.has(t.amountCents)) byAmount.set(t.amountCents, []);
    byAmount.get(t.amountCents)!.push(t);
  }
  for (const [amountCents, list] of byAmount) {
    if (list.length >= 2) {
      return make("round-number-cash", "low", list.map((t) => t.id), {
        amountCents,
        occurrences: list.length,
      });
    }
  }
  return null;
}

export function runIntegrityRules(txns: Transaction[]): Anomaly[] {
  seq = 0;
  return [
    unrecordedFulfillmentRevenue(txns),
    duplicateCharge(txns),
    priceVariance(txns),
    commingling(txns),
    vendorAging(txns),
    roundNumberCash(txns),
  ].filter((a): a is Anomaly => a !== null);
}

/** 0–100 integrity score: start at 100, subtract per finding by severity. */
export function integrityScore(anomalies: Anomaly[]): number {
  const penalty = { high: 22, medium: 12, low: 5 } as const;
  return Math.max(0, 100 - anomalies.reduce((s, a) => s + penalty[a.severity], 0));
}

export const RULE_COPY: Record<Anomaly["ruleId"], { title: string; why: string }> = {
  "unrecorded-fulfillment-revenue": {
    title: "Shipping collected but never booked as revenue",
    why: "Postage costs are booked all period, but shipping income never appears — money customers paid is missing from the books, understating revenue on every shipped order.",
  },
  "price-variance": {
    title: "Same item, different prices",
    why: "The same product sold at materially different prices to different customers — worth a documented pricing policy, for fairness and for margins.",
  },
  "commingling": {
    title: "Personal spending in the business account",
    why: "Personal purchases mixed into business books blur taxes and audit trails. Book them as owner draws — or better, move them to a personal account.",
  },
  "duplicate-charge": {
    title: "Possible duplicate charge",
    why: "The same vendor charged the same amount twice within a day. If unintended, that's recoverable money.",
  },
  "vendor-aging": {
    title: "Supplier paid late",
    why: "An invoice was paid well past its due date. Late payments strain the suppliers a small business depends on — fair operations start with paying on time.",
  },
  "round-number-cash": {
    title: "Repeated round-number cash deposits",
    why: "Regular identical cash deposits are fine — just keep deposit records that document where each came from.",
  },
};
