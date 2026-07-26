"use client";

import { useEffect, useRef, useState } from "react";

/**
 * BackgroundLoop (knowledge#2608) — a chrome-free player that plays a list of clips
 * back to back, then loops forever, for the interview second monitor.
 *
 * ZERO chrome: no controls, no text, no cursor (hidden), no scrollbar. It just plays.
 * ROBUST: each clip is probed; a clip that fails to load is skipped so the loop never
 * stalls on a broken source. If NOTHING plays, an honest black screen — never a
 * broken player and never a placeholder (the #2608 DoD).
 */
export default function BackgroundLoop({
  clips,
  source,
}: {
  clips: string[];
  source: "background-folder" | "fallback";
}) {
  const [i, setI] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // advance to the next clip (wrap → forever loop)
  const next = () => setI((prev) => (clips.length ? (prev + 1) % clips.length : 0));

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // some browsers need an explicit play() after src swap
    v.play().catch(() => {
      /* autoplay blocked or source bad → onEnded/onError will advance */
    });
  }, [i]);

  // hide the cursor after idle so nothing shows on the monitor
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  const src = clips[i];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
        cursor: "none",
      }}
    >
      {src ? (
        <video
          ref={videoRef}
          key={src}
          src={src}
          autoPlay
          muted
          playsInline
          preload="auto"
          // single clip → loop it; multiple → advance on end
          loop={clips.length === 1}
          onEnded={next}
          onError={next}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}
      {/* dev-only source marker, invisible in the render (title for hover) */}
      <span title={`source:${source} · ${clips.length} clips`} aria-hidden style={{ display: "none" }} />
    </div>
  );
}
