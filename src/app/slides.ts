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
  // ── THE FIVE WE ARE EDITING ─────────────────────────────────────────────
  // Plain 1..5. All the pitch work happens on these.
  { id: "s1", label: "1. Hero — This is RAW." },
  { id: "s2", label: "2. Problem — one device tries to be everything" },
  { id: "s-solution", label: "3. Solution — devices where brainrot isn't possible" },
  { id: "s7", label: "4. Market — every profession gets its own" },
  { id: "s5", label: "5. Founder — how it's built, the fleet, live" },

  // ── REFERENCE (everything after; material to pull INTO the five) ─────────
  { id: "s-scale", label: "ref · Metrics — the scale (8h39m · 237 pings)" },
  { id: "s-willpower", label: "ref · Metrics — software fixes don't stick" },
  { id: "s-fix", label: "ref · Solution — remove the vector, keep the tool" },
  { id: "s-not-dumb", label: "ref · Solution — why this wins where others died" },
  { id: "s-causal", label: "ref · Metrics — remove the device, everything moves" },
  { id: "s-me", label: "ref · The marketing is me — founder, fleet, the work" },
  { id: "s-receipts", label: "ref · Metrics — policy, law & revenue agree" },
];
