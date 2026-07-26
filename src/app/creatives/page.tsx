import type { Metadata } from "next";
import catalog from "@/data/creatives.json";
import CreativesGallery, { type Creative } from "./CreativesGallery";

/**
 * hack.utopiamodels.ai/creatives (knowledge#2608) — the live RAW creatives wall.
 *
 * The 79 assets are real, agent-generated RAW output already sitting behind the
 * CDN. This server component maps the baked catalog (src/data/creatives.json — a
 * static snapshot of the knowledge repo's _infra/catalog/creatives.json .assets,
 * committed here because that repo is private) onto live CDN URLs and hands them to
 * the client masonry gallery. Images always stream from R2; only the index is baked,
 * so the wall WILL NOT pick up new assets mid-interview — that would need a
 * GITHUB_TOKEN env var on this Vercel project to read the private catalog live.
 */
export const metadata: Metadata = {
  title: "RAW creatives — the wall",
  description: "The agent-generated RAW creatives, live from the CDN. DMV Hackathon.",
};

const CDN = "https://assets.utopiamodels.ai";

type CatalogRow = {
  id: string;
  r2_key: string;
  alt: string | null;
  filename: string;
  type: string;
  domain: string;
  project: string;
};

const creatives: Creative[] = (catalog as CatalogRow[]).map((r) => ({
  id: r.id,
  src: `${CDN}/${r.r2_key}`,
  alt: r.alt || r.filename || r.id,
  type: r.type,
  domain: r.domain,
  project: r.project,
}));

export default function CreativesPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--base)",
        color: "var(--text)",
        padding: "56px clamp(16px, 4vw, 48px) 96px",
      }}
    >
      <header style={{ maxWidth: 1400, margin: "0 auto 36px" }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--tan)",
            marginBottom: 14,
          }}
        >
          RAW · the creatives wall
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            lineHeight: 1.02,
            margin: 0,
            color: "var(--text-hi)",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          The marketing is the output.
        </h1>
        <p style={{ marginTop: 14, maxWidth: 620, fontSize: 15, lineHeight: 1.5 }}>
          {creatives.length} real, agent-generated RAW assets — streaming live from the
          CDN. Every image here was produced by the fleet, not a stock library.
        </p>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <CreativesGallery creatives={creatives} />
      </div>
    </main>
  );
}
