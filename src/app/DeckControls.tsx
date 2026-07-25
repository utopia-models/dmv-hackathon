"use client";

/**
 * DeckControls — the two top-right review controls (#2547).
 *
 * 1. SLIDES popup — a checkbox per slide (all on by default). Unchecking hides
 *    that slide from the flow AND removes its right-edge dot. Derives from the
 *    shared `SLIDES` registry so the dots + this list can never desync.
 * 2. TEXT popup — a per-slide checkbox for the top-left review panel
 *    (`ReviewOverlay`). Tyler keeps the script panel on slides where it helps
 *    and off where it distracts.
 *
 * Both controls (and the visibility/text state) are REVIEW-ONLY: `?clean=1`
 * hides them for the judge, exactly like `ReviewOverlay`. The progress dots are
 * existing deck chrome and stay visible in clean mode (all slides shown).
 *
 * ── Why this lives OUTSIDE ReviewOverlay.tsx (owned by mms5377, knowledge#2542):
 * - Hiding a slide: a scoped `<style>` sets `display:none` on the hidden
 *   `<section id>` — the section stays owned by page.tsx, we just suppress it.
 * - Text off: `ReviewOverlay` renders its fixed panel + modal as the only plain
 *   `<div>` children of `<main.deck>` (every slide is a `<section>`; the dots +
 *   these controls render outside `<main>` / via a Radix portal). So
 *   `main.deck > div { display:none }` suppresses exactly the review panel from
 *   the outside, with no edit to ReviewOverlay. We gate it on the current slide
 *   (our own IntersectionObserver, mirroring ReviewOverlay's) to make it
 *   per-slide.
 */

import { useEffect, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { SLIDES } from "./slides";

const CHECK = (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
    <path
      d="M2.5 6.2 5 8.6l4.5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function TogglePopup({
  trigger,
  hint,
  isOn,
  onToggle,
}: {
  trigger: string;
  hint: string;
  isOn: (id: string) => boolean;
  onToggle: (id: string, on: boolean) => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="dc-trigger" aria-label={hint}>
          {trigger}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="dc-pop" sideOffset={8} align="end" collisionPadding={12}>
          <div className="dc-pop-head">{hint}</div>
          {SLIDES.map((s) => (
            <label key={s.id} className="dc-row">
              <Checkbox.Root
                className="dc-box"
                checked={isOn(s.id)}
                onCheckedChange={(v) => onToggle(s.id, v === true)}
              >
                <Checkbox.Indicator className="dc-ind">{CHECK}</Checkbox.Indicator>
              </Checkbox.Root>
              <span className="dc-label">{s.label}</span>
            </label>
          ))}
          <Popover.Arrow className="dc-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default function DeckControls() {
  // Review-only chrome. Start hidden so ?clean=1 never flashes the controls
  // for the judge; reveal after mount when not clean (matches ReviewOverlay).
  const [showControls, setShowControls] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [textOff, setTextOff] = useState<Set<string>>(new Set());
  const [cur, setCur] = useState("s1");

  useEffect(() => {
    const clean = new URLSearchParams(window.location.search).get("clean") === "1";
    setShowControls(!clean);
  }, []);

  // Track the in-view slide so the TEXT toggle can act per-slide. Mirrors
  // ReviewOverlay's observer; kept independent because we can't read its state.
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll("section[id^='s']"));
    if (secs.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target.id) setCur(e.target.id);
        });
      },
      { threshold: 0.5 }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const visible = useMemo(() => SLIDES.filter((s) => !hidden.has(s.id)), [hidden]);

  const toggle = (set: Set<string>, id: string, off: boolean) => {
    const next = new Set(set);
    if (off) next.add(id);
    else next.delete(id);
    return next;
  };

  // Suppress hidden sections (owned by page.tsx) + the review panel on text-off
  // slides (owned by ReviewOverlay) — all from the outside, via CSS.
  const css = useMemo(() => {
    const rules: string[] = [];
    hidden.forEach((id) => rules.push(`#${id}{display:none!important}`));
    if (textOff.has(cur)) rules.push(`main.deck > div{display:none!important}`);
    return rules.join("");
  }, [hidden, textOff, cur]);

  return (
    <>
      {css && <style>{css}</style>}

      <nav className="dots" aria-hidden>
        {visible.map((s) => (
          <a key={s.id} href={`#${s.id}`} />
        ))}
      </nav>

      {showControls && (
        <div className="dc-bar">
          <TogglePopup
            trigger="SLIDES"
            hint="Slides shown"
            isOn={(id) => !hidden.has(id)}
            onToggle={(id, on) => setHidden((h) => toggle(h, id, !on))}
          />
          <TogglePopup
            trigger="TEXT"
            hint="Top-left script per slide"
            isOn={(id) => !textOff.has(id)}
            onToggle={(id, on) => setTextOff((t) => toggle(t, id, !on))}
          />
        </div>
      )}
    </>
  );
}
