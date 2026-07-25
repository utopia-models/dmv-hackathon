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

type Beat = {
  n: number;
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
    n: 1,
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
    n: 2,
    onScreen: "One device tries to be everything.",
    purpose: "Name the design failure. Not willpower — architecture.",
    say: "We stopped noticing that's weird. One device tries to be everything, and that generality is what rots your attention. It's not that phones got worse. It's that they got general.",
    value: "Reframes attention loss as a design failure, not a personal one.",
    benefit: "The user stops blaming themselves.",
    weakest: "\"Isn't that just self-control?\" — Deletion is a decision you remake daily.",
  },
  {
    n: 3,
    onScreen: "It's not what you can do. It's what you can't.",
    purpose:
      "The inversion. Every phone ad competes on capability; this one competes on refusal.",
    say: "Nobody thinks it's strange to own more than one pair of shoes. The phone is the last thing we still expect to be everything at once.",
    value: "Subtraction as the product — the opposite of every spec sheet.",
    benefit: "Focus becomes a feature you buy, not a discipline you maintain.",
    weakest: "\"Why not just delete the apps?\" — A separate device is a decision you make ONCE.",
  },
  {
    n: 4,
    onScreen: "The shift already started. Nobody built the device.",
    purpose:
      "Cultural proof — dumbphones, screen-time apps, grayscale mode all exist because people are solving this WITHOUT the right hardware.",
    say: "People are already trying to fix this. Grayscale mode. App blockers. Dumbphones. They're all workarounds for a device that was never designed for focus. The demand is here. The hardware isn't.",
    value: "Answers an existing movement rather than inventing a need.",
    benefit: "The buyer already wants this and is currently improvising.",
    weakest: "\"How big is that market?\" — Honest answer: the workarounds prove demand; the size is unproven.",
  },
  {
    n: 5,
    onScreen: "A founder and an AI fleet. In public.",
    purpose:
      "Answer 'how does one person build a phone company?' before the judge asks it. The iframe is LIVE — that's the actual operations center, not a screenshot.",
    say: "This is how it gets built. One founder and a fleet of AI agents, running in public — that's the live board, right now. It's how a phone brand ships at this size.",
    warn:
      "The iframe is a REAL live embed of utopiamodels.ai. If the network is bad it may render slow or blank — say 'that's the live board' and keep moving; never wait on it or apologize for it.",
    value: "The company itself is the proof that the operating model works.",
    benefit: "A judge sees the machine that makes plural devices economically possible.",
    weakest:
      "\"Isn't this just one guy?\" — Yes. That's the point: the fleet is the leverage that makes a device-per-profession affordable.",
  },
  {
    n: 6,
    onScreen: "Ten apps. Built for one engineer.",
    purpose:
      "THE CREDIBILITY SPINE. The launcher that actually runs, on a real device, today.",
    say: "That's not a slide — it's a device-owner Android app I wrote, and the app list is eleven lines of Java. I removed Chrome from my own phone five days ago and I've carried it to my engineering job every day since. I'm not projecting adoption. I'm the adoption.",
    warn:
      "Say MANAGED, never 'locked down'. It's a managed work phone, not a kiosk — a judge who swipes finds normal Android underneath. 'The launcher shows ten apps' is TRUE and checkable.",
    value: "Turns the pitch from concept to demonstration.",
    benefit: "Founder is user #1 — real adoption, not projected.",
    weakest: "\"What did you build today?\" — The launcher, the deck, and the brand. Not silicon.",
  },
  {
    n: 7,
    onScreen: "Every profession gets its own.",
    purpose: "The platform thesis — one phone becomes a line.",
    say: "Version one is for me because I'm the engineer. But the UX is the point: designed around one person's actual work. Next is the doctor. The lawyer. The kid who needs to learn and not get farmed.",
    value: "One device becomes a product line — that's what makes it investable.",
    benefit: "Every profession gets a device that fits how they actually work.",
    weakest: "\"Who builds all those?\" — Same launcher, different allowlist. The system is the product.",
  },
  {
    n: 8,
    onScreen: "Building is cool.",
    purpose: "The closer — land on identity, not a product claim.",
    say: "RAW is for builders. The hungry, the taste-driven. Against big-tech boredom, brainrot, and bloat. Building is cool. And the world is yours.",
    warn:
      "\"The world is yours\" appears ONCE, here, as a sign-off. Never mid-pitch as a slogan.",
    profit:
      "Device margin + the curated store. The store is the real business: one device, one mode, one store — we own the shelf. Every new focused device is another store.",
  },
];

export default function ReviewOverlay() {
  const [on, setOn] = useState(false);
  const [cur, setCur] = useState(1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // ON by default — Tyler uses this all day. ?clean=1 hides it for the judge.
    setOn(p.get("clean") !== "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    const secs = Array.from(document.querySelectorAll("section[id^='s']"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const n = parseInt(e.target.id.replace("s", ""), 10);
            if (!Number.isNaN(n)) setCur(n);
          }
        });
      },
      { threshold: 0.5 }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [on]);

  if (!on) return null;
  const b = BEATS.find((x) => x.n === cur) ?? BEATS[0];

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
        <div style={{ color: "#9C805C", letterSpacing: ".14em", fontSize: 11 }}>
          SLIDE {b.n} / {BEATS.length} &nbsp;·&nbsp; click for full script
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
              SLIDE {b.n} &nbsp;·&nbsp; {b.onScreen}
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
