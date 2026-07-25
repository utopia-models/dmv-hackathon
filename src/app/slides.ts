/**
 * The deck's single slide registry (#2547).
 *
 * ONE source of truth for the slide list: the right-edge progress dots map over
 * it, and the top-right visibility popup reads it.
 *
 * `id` MUST match the `<section id="...">` in page.tsx (the IntersectionObserver
 * in ReviewOverlay watches `section[id^='s']` — do not rename the ids here
 * without renaming the sections).
 *
 * ORDER = Tyler's 5-slide pitch structure (2026-07-25).
 *
 * The five SHOWN slides are numbered 1..5 in their labels so the Slides Shown
 * popup reads as the actual pitch. Their supporting evidence carries the same
 * number with a `·`. Everything after is PARKED — still in the deck, still
 * togglable, numbered 6+ so Tyler can see what is held back and slot it in.
 *
 * Merged into slide 2 (Problem): the former s3 "Product — what you can't" and
 * s4 "Thesis — the shift already started". DELETED: s6 (Traction) and s8 (Ask).
 * s6's asset (/slides/6.png, the launcher) is reused by the Solution slide.
 *
 * Non-numeric ids throughout: ReviewOverlay keys BEATS on
 * parseInt(id.replace("s","")), so "s-*" → NaN → ignored. No renumbering, no
 * BEATS edits, no edit to ReviewOverlay.tsx (mms5377's, knowledge#2542).
 */

export type Slide = { id: string; label: string };

export const SLIDES: Slide[] = [
  // ── THE FIVE SHOWN ──────────────────────────────────────────────────────
  { id: "s1", label: "1. Hero — This is RAW." },

  { id: "s2", label: "2. Problem — one device tries to be everything" },
  // The problem's evidence (mms5377, research-backed): size it, then prove it
  // is a design failure and not willpower.
  { id: "s-scale", label: "2· evidence — the scale (8h39m · 237 pings)" },
  { id: "s-willpower", label: "2· evidence — software fixes don't stick" },

  { id: "s-solution", label: "3. Solution — devices where brainrot isn't possible" },
  // The solution's mechanism (mms5377) — answers each metric above by number.
  { id: "s-fix", label: "3· mechanism — remove the vector, keep the tool" },
  { id: "s-not-dumb", label: "3· mechanism — why this wins where the others died" },

  { id: "s7", label: "4. Market — every profession gets its own" },
  { id: "s5", label: "5. Founder — how it's built, the fleet, live" },

  // ── PARKED (after the five; Tyler slots these in when he decides) ────────
  { id: "s-causal", label: "6. Metrics — remove the device, everything moves" },
  { id: "s-me", label: "7. The marketing is me — founder, fleet, the work" },
  { id: "s-receipts", label: "8. Metrics — policy, law & revenue agree" },
];
