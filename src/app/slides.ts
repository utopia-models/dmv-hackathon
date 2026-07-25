/**
 * The deck's single slide registry (#2547).
 *
 * ONE source of truth for the slide list: the right-edge progress dots map over
 * it, and the top-right visibility popup reads it. Before this, the count `8`
 * was hardcoded in `page.tsx` (dots) and implied by `ReviewOverlay`'s BEATS —
 * hiding a slide desynced them. Now the dots + the visibility toggle derive from
 * this array, so cutting a slide stays in sync everywhere those two read.
 *
 * `id` MUST match the `<section id="sN">` in page.tsx (the IntersectionObserver
 * in ReviewOverlay watches `section[id^='s']` — do not rename the ids here
 * without renaming the sections).
 */

export type Slide = { id: string; label: string };

export const SLIDES: Slide[] = [
  { id: "s1", label: "Hero — This is RAW." },
  { id: "s2", label: "Problem — one device tries to be everything" },
  // Metric slides (mms5377, research-backed — Focused Phone Thesis pack).
  // Non-numeric ids per the s-me pattern: ReviewOverlay ignores them, so no
  // renumbering and no BEATS edits; dots + visibility popup read this array.
  { id: "s-scale", label: "Metrics — the scale (8h39m · 237 pings)" },
  { id: "s3", label: "Product — what you can't" },
  { id: "s-willpower", label: "Metrics — software fixes don't stick" },
  { id: "s4", label: "Thesis — the shift already started" },
  { id: "s-causal", label: "Metrics — remove the device, everything moves" },
  // The marketing is me (knowledge#2562) — inserted BEFORE the fleet slide.
  // Non-numeric id ON PURPOSE: ReviewOverlay.tsx (owned by mms5377, knowledge#2542)
  // keys its BEATS on parseInt(id.replace("s","")); "s-me" -> NaN -> it is
  // ignored, so inserting here forces NO renumbering of s5..s8 and needs no
  // edit to ReviewOverlay. The dots + the DeckControls popup read THIS array,
  // so they pick the slide up by position.
  { id: "s-me", label: "The marketing is me — founder, fleet, the work" },
  { id: "s5", label: "How it's built — the fleet, live" },
  { id: "s6", label: "Traction — ten apps, one engineer" },
  { id: "s-receipts", label: "Metrics — policy, law & revenue agree" },
  { id: "s7", label: "Market — every profession gets its own" },
  { id: "s8", label: "Ask — building is cool" },
];
