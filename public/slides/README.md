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

The deck was re-cut to Tyler's 5-slide structure on 2026-07-25. **Section ids are
now semantic, not ordinal** — `n` in the manifest is the ORIGINAL 8-slide
numbering and is NOT the current slide position. Do not read it as one.

| # | section id | renders |
|---|---|---|
| 1 Hero | `s1` | `1.mp4` (video) |
| 2 Problem | `s2` | `2.mp4` (video) |
| 3 Solution | `s-solution` | `6.png` — the launcher still |
| 4 Market | `s7` | per-card `DeviceMedia` only; `lineup-{doctor,lawyer,kid}.mp4` are referenced but NOT YET in the repo (knowledge#2553) |
| 5 Founder | `s5` | `5-occ-poster.png` (behind the LIVE iframe) · `lineup-v0.mp4` (the real Pixel 10 capture) · the `/public/creatives/` glob (3 tiles) |

Everything else in the registry is prefixed `ref ·` — still in the deck, still
togglable, not part of the five.

Orphans (present but wired to nothing): `1.png`, `3.png`, `4.png`, `5.png`,
`7.mp4`, `8.png`, `9.mp4`. Note `1.png` and `8.png` are byte-identical
duplicates of each other, and both are dead.

## ⚠ The Drive folders MIRROR the slides — and nothing enforces it

`00_inputs/DECK-ready/` holds five folders — `slide-1-hero`, `slide-2-problem`,
`slide-3-solution`, `slide-4-market`, `slide-5-founder`.

**The rule (Tyler, 2026-07-25): each folder contains exactly what that slide
renders — no more.** Open `slide-5-founder` and you see slide 5's assets. That is
what makes the deck auditable from Drive without opening the site.

**There is NO automation.** Drive → site is entirely manual:

```
drive-download → place in public/ → update manifest.json
               → pnpm verify:manifest → commit → push → Vercel
```

Consequences, both of which have already bitten:

1. **Moving a file in Drive changes nothing on the site.** The site serves
   committed bytes under `public/`; Drive is a human-facing library. They are
   connected only by a human keeping `manifest.json` honest.
2. **Editing a slide changes nothing in Drive.** The folders silently go stale
   the moment a slide is re-cut. On 2026-07-25 all five drifted this way — they
   had been populated under the deck's OLD numbering, then the deck was merged
   and reordered underneath them.

**So: if you change what a slide renders, update its Drive folder in the same
pass.** And when reconciling, **match by md5, never by filename** — the filenames
are assigned by hand and were exactly what disguised the drift.

Tooling is `~/.claude/scripts/google-workspace.sh` (`drive-list`, `drive-upload`,
`drive-rm`, `drive-move`, `drive-mkdir`). It has **no copy and no rename verb** —
both need a raw Drive v3 call. Prefer server-side copy (`files/<id>/copy`) over
re-uploading; most deck assets already exist somewhere in Drive.

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
