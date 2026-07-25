"use client";

/**
 * ReviewOverlay — temporary pitch-review scaffolding.
 *
 * Fixed top-left panel showing, for whichever slide is in view:
 *   PURPOSE  — what this slide is FOR
 *   YOU SAY  — the exact spoken words over it
 *   ⚠ NOTE   — only where something would otherwise get "fixed"
 *
 * Click the panel for the full payload (value / benefit / profitability +
 * the weakest judge question).
 *
 * ON BY DEFAULT — Tyler reviews this all day. Add ?clean=1 to hide it
 * for the judge / the Devpost submission link.
 */

import { useEffect, useState } from "react";

/*
 * ⚠ BEATS are keyed by SECTION ID (`sid`), not by a number parsed out of the id.
 *
 * The old scheme did `parseInt(id.replace("s",""))`, which meant:
 *   - non-numeric ids ("s-solution", "s-proof") → NaN → the panel silently kept
 *     showing the PREVIOUS slide's script while you scrolled past them, and
 *   - after the 2026-07-25 re-cut, the Market slide (still id `s7`) displayed
 *     "SLIDE 7 / 8" on a 9-section deck, while beats 3/4/6/8 pointed at sections
 *     that had been merged or deleted and were unreachable.
 *
 * Keying on the id makes every slide addressable. The slide NUMBER is not shown
 * at all (Tyler, 2026-07-25) — it drifted against every re-cut and confused more
 * than it helped. The panel shows the script, nothing else.
 */
type Beat = {
  sid: string;
  onScreen: string;
  purpose: string;
  say: string;
  warn?: string;
  value?: string;
  benefit?: string;
  profit?: string;
  weakest?: string;
};

const BEATS: Beat[] = [
  {
    sid: "s1",
    onScreen: "This is RAW.",
    purpose:
      "Show the thesis being lived before arguing it — real person, real place, phone held still.",
    say: "Everybody in this room has the same phone. Not the same brand — the same device. One black rectangle that's your job, your group chat, your bank, your TV, and the thing that keeps you up at 1am.",
    warn:
      "Slide and script are DELIBERATELY out of phase. The image shows calm phone use while you describe the broken phone. The judge feels the gap before you name it. Do not 'fix' this.",
    value: "Opens on the alternative, not the complaint.",
    benefit: "A judge sees what focused use looks like before hearing the argument.",
    weakest: "\"Is that your phone?\" — No. It's the rebrand running the launcher I wrote.",
  },
  {
    sid: "s2",
    onScreen: "People are paying for focus on hardware built against it. Nobody sells them the device.",
    purpose: "Name the design failure. Not willpower — architecture.",
    say: "We stopped noticing that's weird. One device tries to be everything, and that generality is what rots your attention. It's not that phones got worse. It's that they got general.",
    value: "Reframes attention loss as a design failure, not a personal one.",
    benefit: "The user stops blaming themselves.",
    weakest: "\"Isn't that just self-control?\" — Deletion is a decision you remake daily.",
  },
  {
    sid: "s5",
    onScreen: "A founder and an AI fleet. In public.",
    purpose:
      "Answer 'how does one person build a phone company?' before the judge asks it. The iframe is LIVE — that's the actual operations center, not a screenshot.",
    say: "This is how it gets built. One founder and a fleet of AI agents, running in public — that's the live board, right now. It's how a phone brand ships at this size.",
    warn:
      "The embed is LIVE with a real-screenshot poster behind it — if venue wifi dies the poster still reads, and on phones the poster replaces the embed. Either way: say 'that's the live board' and keep moving; never wait on it or apologize for it.",
    value: "The company itself is the proof that the operating model works.",
    benefit: "A judge sees the machine that makes plural devices economically possible.",
    weakest:
      "\"Isn't this just one guy?\" — Yes. That's the point: the fleet is the leverage that makes a device-per-profession affordable.",
  },
  {
    sid: "s7",
    onScreen: "Every profession gets its own.",
    purpose: "The platform thesis — one phone becomes a line.",
    say: "Version one is for me because I'm the engineer. But the UX is the point: designed around one person's actual work. Next is the doctor. The lawyer. The kid who needs to learn and not get farmed.",
    value: "One device becomes a product line — that's what makes it investable.",
    benefit: "Every profession gets a device that fits how they actually work.",
    weakest: "\"Who builds all those?\" — Same launcher, different allowlist. The system is the product.",
  },
];

export default function ReviewOverlay() {
  const [on, setOn] = useState(false);
  const [cur, setCur] = useState("s1");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // ON by default — Tyler uses this all day. ?clean=1 hides it for the judge.
    const isOn = p.get("clean") !== "1";
    setOn(isOn);
    // Stamp review mode on <html> so slides can clear the fixed panel in CSS
    // (slide 5's tall content block opts in via .slide-body--occ).
    document.documentElement.classList.toggle("review-on", isOn);
    return () => document.documentElement.classList.remove("review-on");
  }, []);

  useEffect(() => {
    if (!on) return;
    const secs = Array.from(document.querySelectorAll("section[id^='s']"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target.id) {
            setCur(e.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [on]);

  if (!on) return null;
  // A slide with no beat yet (s-solution, s-proof, …) shows nothing rather than
  // silently displaying some other slide's script — that failure put the wrong
  // words in front of Tyler.
  const b = BEATS.find((x) => x.sid === cur);
  if (!b) return null;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 9999,
          maxWidth: 380,
          padding: "14px 16px",
          background: "rgba(13,13,15,0.92)",
          border: "1px solid rgba(184,172,166,0.28)",
          borderRadius: 8,
          color: "#D8CFC8",
          font: "13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/raw-mark.png"
            alt="RAW"
            width={34}
            height={18}
            style={{ display: "block", flexShrink: 0, opacity: 0.92 }}
          />
          <div style={{ color: "#9C805C", letterSpacing: ".14em", fontSize: 11 }}>
            click for full script
          </div>
        </div>
        <div style={{ marginTop: 10, color: "#9C805C", fontSize: 10, letterSpacing: ".16em" }}>
          PURPOSE
        </div>
        <div style={{ color: "#B8ACA6" }}>{b.purpose}</div>
        <div style={{ marginTop: 10, color: "#9C805C", fontSize: 10, letterSpacing: ".16em" }}>
          YOU SAY
        </div>
        <div style={{ color: "#D8CFC8" }}>&ldquo;{b.say}&rdquo;</div>
        {b.warn && (
          <div style={{ marginTop: 10, color: "#C4AA82", fontSize: 12 }}>&#9888; {b.warn}</div>
        )}
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.86)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 720,
              maxHeight: "84vh",
              overflowY: "auto",
              padding: 28,
              background: "#0D0D0F",
              border: "1px solid rgba(184,172,166,0.3)",
              borderRadius: 10,
              color: "#D8CFC8",
              font: "14px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace",
            }}
          >
            <div style={{ color: "#9C805C", letterSpacing: ".14em", fontSize: 11 }}>
              {b.onScreen}
            </div>
            {[
              ["PURPOSE", b.purpose],
              ["YOU SAY", `“${b.say}”`],
              ["VALUE ADD", b.value],
              ["USER BENEFIT", b.benefit],
              ["PROFITABILITY", b.profit],
              ["WEAKEST QUESTION", b.weakest],
              ["⚠ NOTE", b.warn],
            ].map(([k, v]) =>
              v ? (
                <div key={k as string} style={{ marginTop: 18 }}>
                  <div style={{ color: "#9C805C", fontSize: 10, letterSpacing: ".16em" }}>{k}</div>
                  <div>{v}</div>
                </div>
              ) : null
            )}
            <div style={{ marginTop: 24, color: "#8B7D75", fontSize: 12 }}>click anywhere to close</div>
          </div>
        </div>
      )}
    </>
  );
}
