# Managing Fonts

This app compares open-source fonts. The font catalog comes from **three sources**, and **`src/lib/fonts.ts` + `src/lib/localFonts.ts` are the single source of truth** — add a font there and it loads automatically and shows up in the Game, Browse, and type filters.

- **Current catalog:** ~236 fonts across 5 categories (`sans`, `serif`, `display`, `script`, `mono`).

---

## The three sources

| Source | Where it's hosted | How it loads | Add it by |
| --- | --- | --- | --- |
| `bunny` | [Bunny Fonts](https://fonts.bunny.net) (privacy-friendly Google Fonts mirror) | one combined `<link>` to `fonts.bunny.net/css?family=…` | the generator (`npm run fonts:generate`) |
| `fontsource` | [Fontsource](https://fontsource.org) via jsDelivr CDN | inline `@font-face` → jsDelivr **static** woff2 (`cdn.jsdelivr.net/fontsource/fonts/<id>@latest/<subset>-<weight>-<style>.woff2`), built from the font's `faces` — **no per-font stylesheet request** | the generator |
| `local` | **self-hosted** in `static/fonts/` | inline `@font-face` from its `faces` | hand-edit `src/lib/localFonts.ts` |

**Why no per-font Fontsource stylesheets?** Loading 80+ `<link>`s in `<head>` is render-blocking and delays first paint by seconds. Instead the generator records a static woff2 URL in each Fontsource font's `faces`, and the layout emits all of them as one inline `<style>` of `@font-face` rules. Result: **one** blocking stylesheet (Bunny), zero Fontsource stylesheet requests, and each woff2 is fetched lazily by the browser only when its font is actually rendered.

All loading happens in **`src/routes/+layout.svelte`**, which reads the merged font list and emits the right tag for each source. The preview/Game/Browse code never cares about the source — it just uses `font.family`, so anything that's loaded renders.

> No requests ever go to Google (`googleapis.com` / `gstatic.com`). Bunny is the drop-in replacement.

---

## The data model

Every font is a `Font` object (defined in `src/lib/fonts.ts`):

```ts
interface Font {
  family: string; // CSS font-family, e.g. 'Playfair Display'
  category: FontCategory; // 'sans' | 'serif' | 'display' | 'script' | 'mono'
  source: FontSource; // 'bunny' | 'fontsource' | 'local'
  id?: string; // Fontsource slug (fontsource only)
  faces?: FontFace[]; // @font-face list (local only)
  variants: string[]; // informational (drives the "N styles" count)
  siteUrl: string; // "Visit" link
  downloadUrl: string; // "Download" link
}

interface FontFace {
  // one self-hosted file
  src: string; // path under /static, e.g. '/fonts/MyFont-Regular.woff2'
  weight?: string; // default '400'
  style?: string; // default 'normal'
}
```

`fonts.ts` is **auto-generated** (don't hand-edit it). `localFonts.ts` is **hand-maintained** and is **never touched by the generator**, so your self-hosted fonts survive every regeneration. The two are merged in `src/lib/index.ts` (local entries override a same-named generated font).

---

## Adding a self-hosted font (no API / Font Squirrel / GitHub release)

This is the path for any OSS font that isn't on Bunny or Fontsource.

1. **Get the file(s).** `.woff2` is best (smallest); `.woff`, `.ttf`, `.otf` also work. From a Font Squirrel @font-face kit, use the `.woff2` inside the ZIP.

2. **Drop them in `static/fonts/`.** e.g. `static/fonts/MyCoolFont-Regular.woff2`. (Anything in `static/` is served from the site root, so the URL is `/fonts/MyCoolFont-Regular.woff2`.)

3. **Add an entry to `src/lib/localFonts.ts`:**

   ```ts
   export const localFonts: Font[] = [
     {
       family: 'My Cool Font', // must match the font's real family name
       category: 'display', // sans | serif | display | script | mono
       source: 'local',
       variants: ['regular', '700'],
       faces: [
         {
           src: '/fonts/MyCoolFont-Regular.woff2',
           weight: '400',
           style: 'normal'
         },
         {
           src: '/fonts/MyCoolFont-Bold.woff2',
           weight: '700',
           style: 'normal'
         },
         {
           src: '/fonts/MyCoolFont-Italic.woff2',
           weight: '400',
           style: 'italic'
         }
       ],
       siteUrl: 'https://where-you-got-it.example',
       downloadUrl: 'https://where-you-got-it.example'
     }
   ];
   ```

That's it. The layout turns each `faces` entry into:

```css
@font-face {
  font-family: 'My Cool Font';
  src: url('/fonts/MyCoolFont-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

The font now appears everywhere automatically. (Working example in the repo: **Space Grotesk**, self-hosted from `static/fonts/SpaceGrotesk.ttf` because it's not on Bunny.)

---

## Adding fonts from Bunny / Fontsource (the popular set)

These come from the generator, which picks the most popular families per category.

```bash
npm run fonts:generate     # rewrites src/lib/fonts.ts (live data)
```

To change how many or which: edit `scripts/generate-fonts.cjs`:

- `GTAKE` — how many Google/Bunny fonts per category (by popularity).
- `FSTAKE` — per-category cap for Fontsource non-Google fonts (`null` = all).
- `excluded()` — drop unwanted families (already filters emoji/icon/CJK/brand fonts).

The generator pulls Google Fonts metadata (served via Bunny) and Fontsource's `type=other` (non-Google) list, dedupes, and writes `fonts.ts`. It never touches `localFonts.ts`.

### Hand-picking specific Google fonts (`scripts/extra-fonts.txt`)

Want a Google font that isn't popular enough to be auto-selected? Just **drop its name in `scripts/extra-fonts.txt`, one family per line**, and run `npm run fonts:generate`. The script looks each name up in the Google metadata (for its category + weights), verifies it exists on Bunny (so it can't break the combined stylesheet), and adds it regardless of popularity.

```
# scripts/extra-fonts.txt
Onest
Pixelify Sans
```

It reports anything it skips and **silently omits** it from the catalog (never errors):

- **already in the catalog** or **listed twice** → reported as a duplicate, skipped
- **misspelled / not on Google Fonts** → reported as not found
- **not available on Bunny** → reported, skipped

Example run output:

```
Extra fonts added (2): Onest, Pixelify Sans
Skipped, duplicate (1): Gabarito (already in catalog)
Skipped, NOT FOUND on Google Fonts — check spelling (1): Inteer
```

**One-off manual add** (without the generator): you can also add a `Font` entry directly to `localFonts.ts` with `source: 'bunny'` (any Bunny family) or `source: 'fontsource'` (with the Fontsource `id`).

---

## Tests

```bash
npm test          # run once (vitest)
npm run test:watch
```

Unit tests cover the pure logic (no network, no DOM):

- `game.test.ts` — the tournament engine (bracket creation, advancing, byes for odd counts, single winner).
- `filterFonts.test.ts` — search + category filtering (`filterFonts`).
- `fontFaces.test.ts` — the `@font-face` CSS builder (`buildFontFaceCss`, `faceFormat`).
- `fonts.test.ts` — catalog integrity (required fields, valid category/source, Fontsource faces, no duplicate families).

---

## How `siteUrl` and `downloadUrl` work

They're just the targets of the **Visit** (↗) and **Download** (⤓) links shown in `FontHeader`, the Browse table, the Game winner certificate, and the font detail page (`/[slug]`).

They're filled in per source:

| Source       | `siteUrl`                             | `downloadUrl`    |
| ------------ | ------------------------------------- | ---------------- |
| `bunny`      | `https://fonts.bunny.net/family/<id>` | _(same)_         |
| `fontsource` | `https://fontsource.org/fonts/<id>`   | _(same)_         |
| `local`      | whatever you put in `localFonts.ts`   | whatever you put |

> **Note:** for `bunny`/`fontsource` the two URLs are currently **identical** — both open the font's info/family page. The "Download" button does **not** fetch a file directly (Bunny/Fontsource don't expose a one-click ZIP); it opens the page where you can get the font. For `local` fonts, set them to wherever you obtained the font.

---

## Categories & previews

- The 5 categories drive the **type filter** on the Game and Browse pages.
- **`mono`** fonts render in a syntax-highlighted **code block** with a ligatures toggle (`CodePreview.svelte`); every other category renders in the article/note specimen (`NotePreview.svelte`). The switch happens in `FontPreview.svelte` based on `font.category === 'mono'`.

---

## Removing a font

- **Generated (bunny/fontsource):** lower the `GTAKE`/`FSTAKE` counts or add the family to `excluded()` in `scripts/generate-fonts.cjs`, then `npm run fonts:generate`.
- **Local:** delete its entry from `localFonts.ts` (and optionally its file from `static/fonts/`).

---

## File map

| File | Role |
| --- | --- |
| `src/lib/fonts.ts` | **generated** Bunny + Fontsource catalog (don't hand-edit) |
| `src/lib/localFonts.ts` | **hand-edited** self-hosted fonts (regenerator-safe) |
| `src/lib/index.ts` | merges generated + local into the exported `fonts` |
| `src/routes/+layout.svelte` | loads each source (Bunny link / Fontsource links / local `@font-face`) |
| `src/lib/FontPreview.svelte` | picks code vs article specimen by category |
| `scripts/generate-fonts.cjs` | regenerates `fonts.ts` (`npm run fonts:generate`) |
| `static/fonts/` | self-hosted font files |
