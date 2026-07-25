"use client";

import { useEffect, useState } from "react";

type Props = {
  /** path under /public, e.g. "/slides/lineup-v0.mp4" */
  src: string;
  /** "video" (default) or "image" */
  kind?: "image" | "video";
  /**
   * "phone"  → portrait device frame (v0 — a real phone screen, 1080×2424)
   * "wide"   → 16:9 landscape card (the concept environments)
   */
  frame?: "phone" | "wide";
  alt?: string;
};

/**
 * An INLINE media slot for the lineup cards (slide 7).
 *
 * Same discipline as SlideMedia: the asset is probed CLIENT-SIDE before it is
 * shown, so a missing/404 file renders NOTHING — no broken glyph, no reserved
 * gap, no layout shift. That is what lets the three concept cards (Doctor /
 * Lawyer / Kid) carry a slot TODAY that stays invisible until knowledge#2553's
 * videos land at these paths — then they simply appear, no code change.
 *
 * v0 is the exception that is real NOW: it uses `frame="phone"` so the honest
 * asymmetry of the slide is literal — the shipped device looks like a phone;
 * the coming ones are landscape environments.
 */
export default function DeviceMedia({ src, kind = "video", frame = "wide", alt = "" }: Props) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    if (kind === "image") {
      const img = new Image();
      img.onload = () => alive && setOk(true);
      img.onerror = () => {};
      img.src = src;
    } else {
      fetch(src, { method: "HEAD" })
        .then((r) => alive && r.ok && setOk(true))
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [src, kind]);

  if (!ok) return null;

  return (
    <div className={`device-frame device-frame--${frame}`}>
      {kind === "video" ? (
        <video className="device-media" autoPlay muted loop playsInline preload="metadata">
          <source src={src} />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="device-media" src={src} alt={alt} draggable={false} />
      )}
    </div>
  );
}
