# /public/slides — deck background media (optional, hot-swappable)

Each slide has a background-media slot that mounts **client-side only** and
probes the asset before showing it — so a missing file renders NOTHING (the
warm panel + its one line still show; the page never breaks). Because a miss is
silent, a manifest/disk mismatch does **not** surface in the browser — run the
manifest gate (below) to catch it.

## The rule — read the manifest, never hardcode

**Never hardcode which asset a slide uses.** The mapping lives in exactly one
place: [`/manifest.json`](../../manifest.json) at the repo root — slide number →
local asset path → Drive file id → a content label. A reorder or an asset swap
is a **one-line edit there**, so Drive and the code cannot silently drift apart.
The `content` label records what each asset actually shows, so when a slide
moves a human can confirm the move is correct.

Boundary: the slide **registry** (knowledge#2547) owns slide ORDER/identity; the
manifest owns slide → ASSET. They do not duplicate each other.

## Current mapping (source of truth is `/manifest.json`)

| slide | file | note |
|---|---|---|
| 1 Hero | `1.mp4` | video (autoplay muted loop) |
| 2 Problem | `2.mp4` | video |
| 3 Product | `3.png` | the RAW phone |
| 4 Thesis | `4.png` | |
| — The marketing is me | montage | `id="s-me"` (knowledge#2562) — glob of `/public/creatives/`, not a single asset; see `public/creatives/README.md`. Sits immediately before the fleet slide. |
| 5 How it's built | `5-occ-poster.png` | poster behind the LIVE OCC iframe — Izzu's slide (knowledge#2542) |
| 6 Traction | `6.png` | |
| 7 Market | — | typographic lineup (`DEVICES.map`), no media |
| 8 Ask | `8.png` | |

Orphans (present but wired to nothing): `1.png`, `5.png`, `7.mp4`, `9.mp4` —
recorded under `unused` in the manifest, not deleted.

## Formats

Assets are **`.png` for stills and `.mp4` for video** (an earlier version of this
README claimed `.webp`; nothing shipped is `.webp`). A still uses the default
image slot; video uses `<n>.mp4` with `kind="video"` on the `SlideMedia` slot
(autoplay muted loop playsinline). Keep everything warm-monochrome per
`raw/RAW-BRAND-BRIEF.md`. Assets should look SHOT, not rendered.

## Verify (DoD gate)

```
pnpm verify:manifest    # every manifest asset resolves on disk;
                        # every /slides ref in page.tsx is in the manifest.
```

Exits non-zero on any mismatch — the loud version of `SlideMedia`'s silent miss.
