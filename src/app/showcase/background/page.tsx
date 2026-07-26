import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import BackgroundLoop from "../../creatives/background/BackgroundLoop";

/**
 * creatives.utopiamodels.ai/background (knowledge#2608) — the chrome-free looping
 * surface for the interview second monitor. Served via host-routing middleware
 * (creatives host "/background" -> "/showcase/background").
 *
 * Clips resolved at BUILD TIME from public/creatives/background/ — the 24
 * scenario-<v0|doctor|lawyer|kid>-<n>.mp4 clips from knowledge#2606, committed here.
 * Drop more in and they play, no code edit. If the folder is empty, the four real
 * committed lineup clips are the fallback so the loop is never empty, never a
 * placeholder (the DoD).
 */
export const metadata: Metadata = {
  title: "RAW — background loop",
  description: "Unattended looping background for the interview second monitor.",
  robots: { index: false, follow: false },
};

const VIDEO_RE = /\.(mp4|webm)$/i;

const FALLBACK = [
  "/slides/lineup-v0.mp4",
  "/slides/lineup-doctor.mp4",
  "/slides/lineup-lawyer.mp4",
  "/slides/lineup-kid.mp4",
];

function resolveClips(): { clips: string[]; source: "background-folder" | "fallback" } {
  try {
    const dir = join(process.cwd(), "public", "creatives", "background");
    const dropped = readdirSync(dir)
      .filter((f) => VIDEO_RE.test(f))
      .sort();
    if (dropped.length > 0) {
      return { clips: dropped.map((f) => `/creatives/background/${f}`), source: "background-folder" };
    }
  } catch {
    // folder missing at build → fall through
  }
  return { clips: FALLBACK, source: "fallback" };
}

export default function ShowcaseBackgroundPage() {
  const { clips, source } = resolveClips();
  return <BackgroundLoop clips={clips} source={source} />;
}
