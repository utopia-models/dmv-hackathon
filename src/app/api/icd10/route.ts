import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Icd10Entry } from "@/lib/types";

// Full ICD-10-CM 2026 dataset (98k codes) — server-side only, lazy-loaded into
// route memory on first request, never shipped to the client bundle.
let DATA: Icd10Entry[] | null = null;

function load(): Icd10Entry[] {
  if (DATA) return DATA;
  const raw = readFileSync(join(process.cwd(), "src/data/icd10.tsv"), "utf8");
  DATA = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [code, billable, description] = line.split("\t");
      return { code, billable: billable === "1", description };
    });
  return DATA;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  const data = load();
  const needle = q.toLowerCase();
  const isCode = /^[a-z]\d/i.test(q);
  const results: Icd10Entry[] = [];
  for (const e of data) {
    if (isCode ? e.code.toLowerCase().startsWith(needle) : e.description.toLowerCase().includes(needle)) {
      results.push(e);
      if (results.length >= 50) break;
    }
  }
  return NextResponse.json({ results });
}
