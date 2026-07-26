"use client";

import { useEffect, useState } from "react";

/**
 * ShowcaseGallery (knowledge#2608) — the standalone creatives wall for
 * creatives.utopiamodels.ai. Deliberately CHROME-LESS: NO heading, NO title, NO
 * kicker, NO description, NO filter chips. Per Tyler: "no text at the top — the
 * images start at the top of the viewport. Let the work speak."
 *
 * A masonry wall of the curated RAW clips, video-capable (autoplay/muted/loop),
 * with a self-contained click-through lightbox. Zero new dependencies.
 *
 * The item list is built at BUILD TIME by the server page from the files sitting in
 * public/creatives/gallery/ — so adding a visual is a file drop + commit, no code
 * edit. See showcase/page.tsx.
 */
export type Item = { id: string; src: string; alt: string; published?: string };

const isVideo = (s: string) => /\.(mp4|webm|mov)(\?|$)/i.test(s);

/**
 * PublishStamp — the small glass timestamp in the top-left of every tile.
 *
 * Reports when the asset was PUBLISHED to this wall (the deploy time), never when
 * it was created. Sits over both video and image tiles, so it is deliberately
 * high-contrast + blurred: fine detail and thin type disappear over a bright frame.
 *
 * Tile only — never in the lightbox, where a badge fights the full-size image.
 */
function PublishStamp({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 7px",
        borderRadius: 6,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.35)",
        pointerEvents: "none",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#4ade80",
          boxShadow: "0 0 5px rgba(74,222,128,0.9)",
          flex: "0 0 auto",
        }}
      />
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 9.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.92)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ShowcaseGallery({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (index < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(-1);
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  const active = index >= 0 ? items[index] : null;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#000",
        color: "#fff",
        padding: "12px",
      }}
    >
      {items.length === 0 ? (
        // honest empty state — never a placeholder
        <div style={{ height: "100dvh" }} />
      ) : (
        <div style={{ columnGap: 12, columnWidth: 340 }}>
          {items.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setIndex(i)}
              title={c.alt}
              style={{
                position: "relative",
                display: "block",
                width: "100%",
                marginBottom: 12,
                padding: 0,
                border: "none",
                background: "#0a0a0a",
                borderRadius: 10,
                overflow: "hidden",
                cursor: "zoom-in",
                breakInside: "avoid",
                lineHeight: 0,
              }}
            >
              {c.published && <PublishStamp label={c.published} />}
              {isVideo(c.src) ? (
                <video
                  src={c.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.src}
                  alt={c.alt}
                  loading="lazy"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          onClick={() => setIndex(-1)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.96)",
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
        </div>
      )}
    </main>
  );
}
