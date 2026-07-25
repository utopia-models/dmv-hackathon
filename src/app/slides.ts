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
  { id: "s3", label: "Product — what you can't" },
  { id: "s4", label: "Thesis — the shift already started" },
  { id: "s5", label: "How it's built — the fleet, live" },
  { id: "s6", label: "Traction — ten apps, one engineer" },
  { id: "s7", label: "Market — every profession gets its own" },
  { id: "s8", label: "Ask — building is cool" },
];
