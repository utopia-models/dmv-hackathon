// RawRow[] → Transaction[]: integer cents, stable ids, provenance, rule-pass categories.

import type { Transaction } from "@/lib/types";
import type { RawRow } from "./csv";
import { keywordCategorize } from "./rules";

export function toTransactions(rows: RawRow[], source: string): Transaction[] {
  return rows.map((r, i) => {
    const amountCents = Math.round(Math.abs(r.amount) * 100);
    const { category, confidence } = keywordCategorize(r.description);
    return {
      id: `t${String(i).padStart(4, "0")}`,
      date: r.date,
      description: r.description,
      amountCents,
      direction: r.amount >= 0 ? "in" : "out",
      source,
      category,
      categorizedBy: "rule",
      confidence,
      rawRow: r.rawLine,
    };
  });
}
