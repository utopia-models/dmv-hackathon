# /public/slides — deck background media (optional, hot-swappable)

Each slide has a background-media slot that mounts **client-side only** and
probes the asset before showing it — so a missing file renders NOTHING (the
warm panel + its one line still show; the page never breaks).

Drop assets here to light up the slides. Naming (matches src/app/page.tsx):

| slide | file | note |
|---|---|---|
| 1 Hero | `1.webp` | full-bleed RAW hero |
| 2 Problem | `2.webp` | |
| 3 Product | `3.webp` | the RAW phone |
| 4 Thesis | `4.webp` | |
| 5 How it's built | — | LIVE OCC iframe, no image |
| 6 Traction | `6.webp` | |
| 7 Market | `7.webp` | |
| 8 Ask | `8.webp` | |

Video works too: use `<n>.mp4` and set the slot's `kind="video"` in page.tsx
(autoplay muted loop playsinline). Keep everything warm-monochrome per
raw/RAW-BRAND-BRIEF.md. Assets should look SHOT, not rendered.
