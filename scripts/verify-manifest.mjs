#!/usr/bin/env node
/**
 * verify-manifest.mjs — DoD gate for the slide asset manifest.
 *
 * SlideMedia.tsx renders NOTHING when an asset is missing (no broken image, no
 * error) — so a manifest/disk mismatch fails SILENTLY in the browser. This script
 * makes that failure LOUD at build time:
 *
 *   1. Every non-null `asset` in manifest.json resolves to a real file on disk.
 *   2. Every `/slides/<file>` referenced in src/app/page.tsx has a manifest slide
 *      entry (a used asset that isn't manifested is drift the manifest exists to kill).
 *
 * Exits non-zero on any miss.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];

// --- load manifest -----------------------------------------------------------
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
} catch (e) {
  console.error("FAIL: cannot read/parse manifest.json —", e.message);
  process.exit(1);
}

// --- 1. every manifest asset resolves on disk --------------------------------
// Collect nested slide-7 lineup assets too (knowledge#2582) — they are real
// /slides/* paths referenced by page.tsx and must pass both checks like any other.
const lineupEntries = (manifest.slides ?? [])
  .filter((s) => s.lineup)
  .flatMap((s) => Object.values(s.lineup));
const entries = [...(manifest.slides ?? []), ...lineupEntries, ...(manifest.unused ?? [])];
const manifestAssets = new Set();
for (const e of entries) {
  if (!e.asset) continue; // slides 5 & 7 have no media asset — that is valid
  manifestAssets.add(e.asset);
  if (!existsSync(join(root, e.asset))) {
    problems.push(`missing on disk: ${e.asset} (manifest ${e.n ? "slide " + e.n : "unused"})`);
  }
}

// --- 2. every asset used by page.tsx is in the manifest ----------------------
const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const used = new Set([...page.matchAll(/\/slides\/([\w.-]+)/g)].map((m) => `public/slides/${m[1]}`));
for (const u of used) {
  if (!manifestAssets.has(u)) {
    problems.push(`used by page.tsx but NOT in manifest: ${u}`);
  }
}

// --- report ------------------------------------------------------------------
if (problems.length) {
  console.error("manifest verification FAILED:");
  for (const p of problems) console.error("  ✗ " + p);
  process.exit(1);
}
const usedCount = manifest.slides.filter((s) => s.asset).length;
console.log(`manifest OK — ${usedCount} slide assets + ${manifest.unused?.length ?? 0} unused, all resolve; page.tsx refs all mapped.`);
