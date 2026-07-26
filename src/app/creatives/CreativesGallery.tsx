"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * CreativesGallery — the live RAW creatives wall for hack.utopiamodels.ai/creatives
 * (knowledge#2608). Reuses the idiom of the monorepo's CreativesGallery.tsx —
 * masonry layout, client-measured natural dimensions, a video-capable lightbox —
 * but with ZERO new dependencies (CSS-columns masonry + a self-contained lightbox),
 * so it adds nothing to the deck's lockfile an hour before the judges.
 *
 * Images stream live from the CDN (assets.utopiamodels.ai ← R2). Only the 79-row
 * index is baked into the repo (src/data/creatives.json) because the knowledge repo
 * is private — the images are always live, the index is a static snapshot.
 *
 * A row whose src ends in .mp4/.webm/.mov renders as a video (forward-compatible
 * with the motion rows); the current catalog is all images.
 */
export type Creative = {
  id: string;
  src: string;
  alt: string;
  type: string;
  domain: string;
  project: string;
};

function isVideo(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

const TYPE_LABELS: Record<string, string> = {
  "brand-visual": "Brand visual",
  "character-sheet": "Character sheet",
  reference: "Reference",
};

export default function CreativesGallery({ creatives }: { creatives: Creative[] }) {
  const [dims, setDims] = useState<Record<string, { w: number; h: number }>>({});
  const [filter, setFilter] = useState<string>("all");
  const [index, setIndex] = useState(-1);

  // measure natural dimensions client-side (the catalog carries no dimension data)
  useEffect(() => {
    creatives.forEach((c) => {
      if (dims[c.id] || isVideo(c.src)) return;
      const img = new Image();
      img.onload = () =>
        setDims((d) => ({ ...d, [c.id]: { w: img.naturalWidth || 4, h: img.naturalHeight || 3 } }));
      img.onerror = () => setDims((d) => ({ ...d, [c.id]: { w: 4, h: 3 } }));
      img.src = c.src;
    });
  }, [creatives, dims]);

  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    creatives.forEach((c) => (counts[c.type] = (counts[c.type] ?? 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [creatives]);

  const shown = useMemo(
    () => (filter === "all" ? creatives : creatives.filter((c) => c.type === filter)),
    [creatives, filter],
  );

  // keyboard nav for the lightbox
  useEffect(() => {
    if (index < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(-1);
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % shown.length);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + shown.length) % shown.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, shown.length]);

  const chip = (key: string, label: string, n: number) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      style={{
        appearance: "none",
        border: "1px solid",
        borderColor: filter === key ? "#fff" : "rgba(255,255,255,0.18)",
        background: filter === key ? "#fff" : "transparent",
        color: filter === key ? "#000" : "rgba(255,255,255,0.72)",
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: 13,
        letterSpacing: "0.01em",
        cursor: "pointer",
        transition: "all 120ms ease",
      }}
    >
      {label} <span style={{ opacity: 0.55 }}>{n}</span>
    </button>
  );

  const active = index >= 0 ? shown[index] : null;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        {chip("all", "All", creatives.length)}
        {types.map(([t, n]) => chip(t, TYPE_LABELS[t] ?? t, n))}
      </div>

      <div
        style={{
          columnGap: 12,
          columnWidth: 300,
        }}
      >
        {shown.map((c, i) => {
          const d = dims[c.id] ?? { w: 4, h: 3 };
          return (
            <button
              key={c.id}
              onClick={() => setIndex(i)}
              title={c.alt}
              style={{
                display: "block",
                width: "100%",
                marginBottom: 12,
                padding: 0,
                border: "none",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                overflow: "hidden",
                cursor: "zoom-in",
                breakInside: "avoid",
                lineHeight: 0,
              }}
            >
              {isVideo(c.src) ? (
                <video
                  src={c.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.src}
                  alt={c.alt}
                  loading="lazy"
                  width={d.w}
                  height={d.h}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <div
          onClick={() => setIndex(-1)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          {isVideo(active.src) ? (
            <video
              src={active.src}
              controls
              autoPlay
              loop
              playsInline
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={active.src}
              alt={active.alt}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          )}
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            {active.alt} · {TYPE_LABELS[active.type] ?? active.type} · {index + 1}/{shown.length}
          </div>
        </div>
      )}
    </>
  );
}
