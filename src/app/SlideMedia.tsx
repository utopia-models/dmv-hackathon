"use client";

import { useEffect, useState } from "react";

type Props = {
  /** path under /public, e.g. "/slides/3.webp" or "/slides/3.mp4" */
  src: string;
  /** "image" (default) or "video" */
  kind?: "image" | "video";
  alt?: string;
};

/**
 * A background media slot that NEVER breaks the slide.
 *
 * The media element is mounted CLIENT-SIDE ONLY (after hydration) and probed
 * before it is shown, so a missing/404 asset produces NOTHING — no broken-image
 * glyph, no alt text, no layout shift. The warm panel + its one line always
 * render on their own. Real assets swap in by dropping a file at `src`.
 */
export default function SlideMedia({ src, kind = "image", alt = "" }: Props) {
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  useEffect(() => {
    let alive = true;
    if (kind === "image") {
      const img = new Image();
      img.onload = () => alive && setStatus("ok");
      img.onerror = () => alive && setStatus("idle");
      img.src = src;
    } else {
      // Probe the video URL cheaply; only mount the <video> if it exists.
      fetch(src, { method: "HEAD" })
        .then((r) => alive && r.ok && setStatus("ok"))
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [src, kind]);

  if (status !== "ok") return null;

  if (kind === "video") {
    return (
      <>
        <video className="slide-media" autoPlay muted loop playsInline preload="metadata">
          <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
        <div className="slide-scrim" />
      </>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="slide-media" src={src} alt={alt} draggable={false} />
      <div className="slide-scrim" />
    </>
  );
}
