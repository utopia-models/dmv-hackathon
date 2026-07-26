# creatives.utopiamodels.ai — the gallery source folder

Every media file in this folder becomes a tile on **creatives.utopiamodels.ai**.
The page (`src/app/showcase/page.tsx`) reads this directory at build time, so the
wall changes when the folder changes — **no code edit required**.

## The ONE command to add a visual

```bash
cp /path/to/new-visual.mp4 public/creatives/gallery/ && git add -A && git commit -m "creatives: add new-visual" && git push
```

On push, Vercel rebuilds and the new tile appears. Supported: `.mp4 .webm .mov
.png .jpg .jpeg .webp`. Tiles render in filename sort order.

Current curated set (Tyler's scope, knowledge#2608): the clips from the five
`00_inputs/DECK-ready/slide-*` folders — the vetted deck assets, not the older
79-row catalog.
