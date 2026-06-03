# How the Google Fonts Get In

Most of the catalog fills in automatically. A script reads Google's font list and keeps the most popular ones in each category, so you don't add them by hand.

The fonts you host yourself are the exception. For those, see [Add a Font by Hand](./add-a-font-by-hand.md).

## The short version

Run `npm run fonts:generate`. It downloads Google's font list, ranks each category by use, keeps the top few, and writes them to `src/lib/fonts.ts`. The app reads that file. Visitors never hit Google for the fonts: a privacy mirror called Bunny serves them.

Don't edit `src/lib/fonts.ts` yourself. The next run overwrites it.

## What Google tells us about each font

Google's list carries a few facts per family:

- its name (Roboto, Lobster, Inter)
- a category: Sans Serif, Serif, Display, Handwriting, or Monospace
- a popularity rank
- the designer and the weights it ships
- a use label called `classifications`, such as "Display" for headline faces

The script picks fonts by popularity and category, and uses the label for one special case below.

## Popularity is one ranking

Popularity is a single ranking across every Google font, where a lower number means more use. Roboto sits near the top. Rank 269 is middling.

The script doesn't take the most popular fonts overall. It takes the most popular in each category, counted separately:

| Category | How many it keeps |
| -------- | ----------------- |
| Sans     | 44                |
| Serif    | 32                |
| Display  | 32                |
| Script   | 24                |
| Mono     | 24                |

The categories aren't equally deep, so the same rank means different things in each.

## Why a "popular" font can still miss the cut

Sans is the deepest category. The most-used sans fonts all sit there (Roboto, Open Sans, Inter, Montserrat), so even the 44th sans is widely used. Display has far fewer heavily-used fonts.

Tenor Sans is global rank 269. Counted against other sans fonts it comes 139th, past the top 44, so it misses the sans bracket. Counted against display fonts it comes 28th, inside the top 32. So it shows up as a display font, and never qualifies as a sans.

This is on purpose. Each font competes against its own category, which keeps every bracket full. Drop the per-category cut and the popular sans fonts would swamp the display, script, and mono brackets.

## The one rewrite the script makes

Google labels a font two ways, and the two can disagree.

- `category` is the shape. Bebas Neue has no serifs, so Google files it under Sans Serif.
- `classifications` is the job. Bebas Neue is built for headlines, so it also carries the "Display" label.

Bebas Neue is a tall, all-caps poster face, not a body font. In the sans bracket it would sit next to Inter and Roboto, which makes for a poor comparison. So the script moves it to display.

The rule: a font that ships a single weight and carries the "Display" label moves to display, whatever its shape. That catches the headline cuts (Bebas Neue, Archivo Black, Anton) and leaves the full families alone. Saira, Titillium Web, and Playfair Display carry the "Display" label too, but they ship a full weight range, so they stay where their shape puts them.

Each run prints what it moved:

```
Reclassified to display (single-weight Display-tagged headline cuts, 3): Archivo Black (Sans Serif), Bebas Neue (Sans Serif), DM Serif Display (Serif)
```

The rule lives in one function, `googleBucket()`, in `scripts/fonts-shared.cjs`. Change it there if you want different fonts to move.

## Two extras the script folds in

**Hand-picked Google fonts.** To force in a Google font that isn't popular enough on its own, add its name to the `google:` list in `scripts/fonts.yaml`. The script looks it up, checks that Bunny carries it, and adds it regardless of rank.

**Fontsource fonts.** Fontsource is a second library of open fonts that aren't on Google. The script pulls those in and inlines them, so they cost no extra page request until someone renders one.

## Where it all ends up

The script writes everything to `src/lib/fonts.ts`. From there:

- The **Game** builds two brackets per category. Quick takes the top 24 popular fonts. Full adds your self-hosted fonts and a short hand-picked list from `src/lib/featured.ts`.
- **Browse** shows the whole catalog.
- The **type filter** uses the five categories.

To change how many fonts come in, or to drop one, open `scripts/generate-fonts.cjs`. `GTAKE` sets the count per category, and `excluded()` blocks families by name. Run `npm run fonts:generate` again after either edit.
