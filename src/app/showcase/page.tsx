import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import ShowcaseGallery, { type Item } from "./ShowcaseGallery";

/**
 * creatives.utopiamodels.ai (knowledge#2608) — the standalone RAW creatives wall.
 *
 * Served at the ROOT of creatives.utopiamodels.ai via host-routing middleware
 * (middleware.ts rewrites that host's "/" -> "/showcase"). This keeps it a clean
 * standalone surface without a new Vercel project — it rides the already-green
 * dmv-hackathon deployment. The deck (hack.utopiamodels.ai) is untouched: the
 * middleware only fires for the creatives host, on "/" and "/background".
 *
 * CURATED SCOPE (Tyler's call): show ONLY what he and the fleet curated tonight —
 * the assets in the five 00_inputs/DECK-ready/ slide folders, committed here to
 * public/creatives/gallery/. Not the older 79-row catalog.
 *
 * CHURN-FRIENDLY: the wall is built from whatever media sits in
 * public/creatives/gallery/ at build time — adding a visual is a file drop + commit,
 * NO code change. See the "ONE command to add a visual" note in the PR / README.
 */
export const metadata: Metadata = {
  title: "RAW creatives",
  description: "RAW creative output.",
};

const MEDIA_RE = /\.(mp4|webm|mov|png|jpe?g|webp)$/i;

function loadItems(): Item[] {
  try {
    const dir = join(process.cwd(), "public", "creatives", "gallery");
    return readdirSync(dir)
      .filter((f) => MEDIA_RE.test(f))
      .sort()
      .map((f) => ({
        id: f,
        src: `/creatives/gallery/${f}`,
        alt: f.replace(/\.[^.]+$/, ""),
      }));
  } catch {
    return [];
  }
}

export default function ShowcasePage() {
  return <ShowcaseGallery items={loadItems()} />;
}
