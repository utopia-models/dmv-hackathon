#!/usr/bin/env node
// Downloads the PUBLIC CMS ICD-10-CM 2026 code file and emits src/data/icd10.tsv.
// Run during the DMV Hackathon 2026-07-25 — the download is logged to DOWNLOAD-LOG.md
// to document that this dataset was regenerated fresh from its public source today.
//
// Source: CMS "April 1, 2026 Code Descriptions in Tabular Order" (FY2026)
// Fixed-width member file: Code Descriptions/icd10cm_order_2026.txt
//   cols 1-5 order# · 7-13 code · 15 billable(0/1) · 17-76 short desc · 78+ long desc

import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = "https://www.cms.gov/files/zip/april-1-2026-code-descriptions-tabular-order.zip";
const MEMBER = "Code Descriptions/icd10cm_order_2026.txt";
const OUT = "src/data/icd10.tsv";

const dir = mkdtempSync(join(tmpdir(), "icd10-"));
const zip = join(dir, "cms.zip");

console.log(`[fetch-icd10] downloading ${URL}`);
execSync(`curl -sfL --max-time 120 -o "${zip}" "${URL}"`);
const raw = execSync(`unzip -p "${zip}" "${MEMBER}"`, { maxBuffer: 64 * 1024 * 1024 }).toString("latin1");

const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
const out = [];
for (const line of lines) {
  const code = line.slice(6, 13).trim();
  const billable = line.slice(14, 15).trim() === "1" ? "1" : "0";
  const longDesc = line.slice(77).trim() || line.slice(16, 76).trim();
  if (!code) continue;
  // Dotted display form: first 3 chars, dot, remainder (if any)
  const dotted = code.length > 3 ? `${code.slice(0, 3)}.${code.slice(3)}` : code;
  out.push(`${dotted}\t${billable}\t${longDesc.replace(/\t/g, " ")}`);
}
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`[fetch-icd10] wrote ${OUT}: ${out.length} codes`);

const stamp = new Date().toISOString();
appendFileSync(
  "DOWNLOAD-LOG.md",
  `- ${stamp} — fetched ${URL} (member: ${MEMBER}) → ${OUT} (${out.length} codes). Public CMS data, regenerated fresh at the DMV Hackathon.\n`
);
console.log(`[fetch-icd10] logged to DOWNLOAD-LOG.md`);
