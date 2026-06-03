# TypefaceOff

> Forked from [Typogram/coding-font-sveltekit](https://github.com/Typogram/coding-font-sveltekit). The original pits coding fonts head-to-head; this fork expands it into a multi-category typeface bracket with Browse, per-font detail pages, and a shareable Top-10 card.

Picking a font from a catalog of hundreds is a slog. TypefaceOff turns it into a single-elimination bracket: you tap A or B, round after round, until a champion is crowned. Finish a bracket and you get a Top-10 placement card worth screenshotting.

Built with SvelteKit 2 + Svelte 5 (runes), Skeleton v4, and Tailwind v4. Prerendered with `adapter-static` and deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev      # Vite dev server (auto-picks a free port)
```

## Other commands

```bash
npm run check     # svelte-check, the type gate
npm run test      # vitest
npm run build     # prerender every route
npm run fonts:all # regenerate font catalogs (needs network)
```

## Adding fonts

Edit `scripts/fonts.yaml`, then run `npm run fonts:all`. Use `google:` for Bunny-hosted families or `local:` for self-hosted faces in `static/fonts/`. See [FONTS.md](FONTS.md) for the full guide.