import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import BackgroundLoop from "./BackgroundLoop";

/**
 * hack.utopiamodels.ai/creatives/background (knowledge#2608) — the chrome-free
 * looping background for the second monitor during the judge interview.
 *
 * SOURCE OF CLIPS (resolved at build time, in priority order):
 *   1. Any .mp4/.webm dropped into public/creatives/background/ — this is where the
 *      knowledge#2606 scenario-<v0|doctor|lawyer|kid>-<n>.mp4 clips land once they
 *      are pulled out of Drive. Drop them there and they play, no code edit.
 *   2. Fallback: the four REAL scenario clips already committed to the deck
 *      (public/slides/lineup-{v0,doctor,lawyer,kid}.mp4) — one per RAW scenario, so
 *      the loop is never empty and never a placeholder.
 *
 * As of this PR the #2606 background-pitch-video Drive folder is still empty, so the
 * loop runs on the fallback set. See the PR body.
 */
export const metadata: Metadata = {
  title: "RAW — background loop",
  description: "Unattended looping background for the interview second monitor.",
  robots: { index: false, follow: false },
};

const VIDEO_RE = /\.(mp4|webm)$/i;

// The four real, committed scenario clips — one per RAW device scenario.
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

export default function BackgroundPage() {
  const { clips, source } = resolveClips();
  return <BackgroundLoop clips={clips} source={source} />;
}
