# Add a Font by Hand

This is for any open font you want to host yourself, the kind Bunny and Fontsource don't carry. Put the files in one folder, add a few lines to a config file, and run one command. After that the font appears in the Game, in Browse, and in the type filters.

For the fonts that arrive on their own from Google, see [How the Google Fonts Get In](./how-the-google-fonts-get-in.md).

## Before you start

You need a font you have the right to redistribute. This app serves the real font files to every visitor, so the license has to allow that. Most open fonts (SIL OFL, Apache, MIT) do. A desktop-only or webfont-kit license that forbids redistribution doesn't, so stop here if that's all you have.

## The five steps

### 1. Get the file

Use `.woff2`. It's the smallest format and every current browser reads it. `.woff`, `.ttf`, and `.otf` also load, but they weigh more.

Got a `.ttf` or `.otf`? Drop it into Fontsource's [web converter](https://fontsource.org/tools/converter) for a `.woff2` back, no install needed.

To shrink the file as well, subset it to Latin on the command line. A full Unicode TTF can run from 200 KB to a megabyte; a Latin `.woff2` lands around 15 to 40 KB:

```bash
pip install fonttools brotli
pyftsubset MyFont.ttf --output-file=MyFont.woff2 --flavor=woff2 \
  --unicodes=U+0000-00FF,U+2018-201F
```

One file is enough to show a font. The browser fakes bold and italic when you don't supply them, so grab the real files if you want those to look right.

### 2. Put the files in `static/fonts/`

Copy each file into `static/fonts/`. That folder is the only place the app looks.

```
static/fonts/MyCoolFont-Regular.woff2
static/fonts/MyCoolFont-Bold.woff2
```

### 3. Describe the font in `scripts/fonts.yaml`

Open `scripts/fonts.yaml` and add an entry under `local:`. A minimal entry has the family, category, designer, license, and files:

```yaml
local:
  - family: My Cool Font
    category: display # sans | serif | display | script | mono
    designer: A. Designer
    license: OFL-1.1
    url: https://example.com/my-cool-font
    files: [MyCoolFont-Regular.woff2, MyCoolFont-Bold.woff2]
```

Fill in `designer` and `license`. No API supplies them for a font you host yourself, so the generator warns when either is blank.

The generator reads the weight and style from each filename. `MyCoolFont-Bold.woff2` becomes weight 700, a `-Light` file becomes 300, and any `-Italic` file gets the italic style. A file with no weight word counts as regular (400). The [weight table](#weight-from-a-filename) lists what it recognizes.

Two variations on the file list.

A variable font holds every weight in one file. Mark it variable:

```yaml
local:
  - family: My Variable Font
    category: sans
    designer: A. Designer
    license: OFL-1.1
    variable: true
    files: [MyVariableFont.woff2]
```

When a filename doesn't spell out its weight, set the faces yourself:

```yaml
local:
  - family: Precise Mono
    category: mono
    designer: A. Designer
    license: OFL-1.1
    faces:
      - { file: Precise.woff2, weight: '400' }
      - { file: Precise-Bd.woff2, weight: '700' }
      - { file: Precise-It.woff2, weight: '400', style: italic }
```

### 4. Ship the license text

You redistribute the font files, so the license text has to travel with them. Put it in `static/fonts/licenses/`, and start the filename with the family name, spaces removed:

```
static/fonts/licenses/MyCoolFont-OFL.txt
```

The generator pairs the license file to the family by that prefix, so `My Cool Font` finds `MyCoolFont-OFL.txt`. Skip this and the build still runs, but you get a warning, and you'd be shipping someone's font without its license.

### 5. Run the generator

```bash
npm run fonts:local
```

It confirms each file exists, reads the weights, and writes `src/lib/localFonts.generated.ts`. Read what it prints. The run never fails on a missing credit or license, so the warnings are your only sign that a step slipped:

- `Skipped, file not found`: a filename in the YAML has no match in `static/fonts/`. Check the spelling.
- `Skipped, invalid entry`: the family name is blank, or the category isn't one of the five.
- `Missing designer:` or `Missing license:`: fill those fields in the YAML.
- `Missing license text`: add the `.txt` from step 4.
- `Unreferenced font files`: a file sits in `static/fonts/` that no entry uses. Wire it up or delete it, or it ships as dead weight.

That's it. The font joins the Game's Full bracket, shows in Browse, and works with the type filters.

Before committing, run `npm run format`: your `fonts.yaml` edit is Prettier-checked (the generated catalog is ignored).

## How it works under the hood

`npm run fonts:local` runs `scripts/generate-local-fonts.cjs`. The script reads the `local:` list, checks the files, infers weights and styles, and writes one array to `src/lib/localFonts.generated.ts`. Leave that output alone; the next run overwrites it.

`src/lib/fontCatalog.ts` merges three lists into the catalog the app uses, and a self-hosted font outranks a catalog font of the same name. So you can replace a Google font by hosting your own copy under the same family.

`src/routes/+layout.svelte` writes an inline `@font-face` for each self-hosted font, pointing at `/fonts/<file>`. That path stays root-relative on purpose: the GitHub Pages build adds the `/REPO` prefix for you. Each specimen fetches its `woff2` only when it scrolls into view (`src/lib/lazyFont.ts`), so a long Browse page downloads only the rows you can see.

## Weight from a filename

The generator scans each filename for these words. A four-digit weight like `-700-` wins over a word.

| In the filename                     | Weight |
| ----------------------------------- | ------ |
| thin, hairline                      | 100    |
| extralight, ultralight              | 200    |
| light                               | 300    |
| regular, normal, book, or no weight | 400    |
| medium                              | 500    |
| semibold, demibold                  | 600    |
| bold                                | 700    |
| extrabold, ultrabold                | 800    |
| black, heavy                        | 900    |

`italic` or `oblique` anywhere in the name sets the style to italic.

## When the YAML can't say it

For anything the `local:` schema won't express, write a full `Font` object into `src/lib/localFonts.ts`. No generator touches that file, so your entry survives every regen, and it overrides a same-named font from any source.

## Removing a font

- **Self-hosted (added via `fonts.yaml`):** delete its `local:` entry and run `npm run fonts:local`. Optionally remove the files from `static/fonts/` and the license text.
- **Self-hosted (added by hand):** delete the `Font` object from `src/lib/localFonts.ts`.
- **Google/Bunny:** if you hand-added it, remove its name from the `google:` list; if it arrived by popularity, add the family to `excluded()` in `scripts/generate-fonts.cjs` (or lower `GTAKE`). Then `npm run fonts:generate`.

## Troubleshooting

**The font doesn't appear.** Run `npm run fonts:local` again and read the output. A `Skipped` line means the file wasn't found or the entry was invalid.

**The text renders in a system font.** The `@font-face` loaded but the file is bad. Open the file in `static/fonts/` with a font viewer, and check that the family name in the YAML matches the name you reference elsewhere.

**Bold or italic looks wrong.** The browser is faking it. Add the real weight or style file and list it under `faces` or `files`.
