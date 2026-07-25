# /public/creatives — the "The marketing is me" creatives wall (knowledge#2562)

This folder is the **repo mirror of the Drive `slide-x/` folder** (knowledge#2548).
The "The marketing is me" slide renders a montage grid of **every file in this
folder** — the grid is a build-time glob in `src/app/page.tsx` (a server
component), so:

> **Adding a file here adds a tile. Removing one removes a tile.** No code edit,
> no manifest entry. Curate by dropping files in / pulling them out.

- Supported: `.png .jpg .jpeg .webp .gif` (rendered as `<img>`), `.mp4 .webm`
  (rendered as muted autoplay loop `<video>`).
- `README.md` and dotfiles are ignored by the glob.
- **Empty folder → honest empty state** (the slide still shows its headline +
  the Instagram CTA; no placeholder/lorem tiles — knowledge#2562 DoD).
- Tyler hand-curates the montage. The Drive `slide-x/` folder
  (`1DNqixwFsU7umDvpxkvipiWEfjOTvIWEJ`) is the human-facing curation surface;
  the chosen files are placed here to render on the static deck.

## Seeded (knowledge#2562)

Seeded with the **real, distinct, otherwise-unused hackathon creatives** (the
generated assets not shown on any other slide) so the wall is credible out of
the box — replace/extend freely:

| file | what it is |
|---|---|
| `raw-phone-in-hand.png` | RAW phone in hand (generated still; was the `public/slides/5.png` orphan) |
| `raw-motion-01.mp4` | RAW motion clip (generated; was the `7.mp4` orphan) |
| `raw-motion-02.mp4` | RAW motion clip (generated; was the `9.mp4` orphan) |

These are real hackathon output, not placeholders. The montage tile order is
alphabetical by filename — prefix `01-`, `02-`… to control order.
