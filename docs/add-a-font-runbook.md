# Runbook: Add a Font (any type)

**Scope:** add one or more fonts to the catalog (Browse), the Game brackets, and the type filters. **Frequency:** as needed. **Last verified:** 2026-06-03.

This is the fast operational path. For the reasoning behind each step, read the deep-dive docs: [Add a Font by Hand](./add-a-font-by-hand.md) (self-hosted) and [How the Google Fonts Get In](./how-the-google-fonts-get-in.md) (popularity intake + reclassification).

The one rule that never changes: **edit `scripts/fonts.yaml` (or a generator), never the generated `src/lib/fonts.ts` or `src/lib/localFonts.generated.ts`.** They are prettier-ignored and overwritten on the next run.

---

## Step 1: Pick the path

| You have... | Path | Source tag | Command to run |
| --- | --- | --- | --- |
| Font files (`.woff2`/`.ttf`/`.otf`) you can redistribute | **A. Self-hosted** | `local` | `npm run fonts:local` (no network) |
| A Google family name that exists on Bunny | **B. Google/Bunny** | `bunny` | `npm run fonts:generate` (needs network) |
| A Fontsource family you want in the Game's Full bracket | **C. Fontsource → quiz** | `fontsource` | edit `featured.ts` (already in Browse) |

Decide first. If a font is on Google, prefer Path B (zero hosting). Use Path A only for fonts Bunny and Fontsource do not carry.

---

## Step 2A: Self-hosted

`designer` and `license` are **required** and no API fills them. Don't guess and don't hesitate: the font file already carries both in its name table. Read them straight from it.

**Fast path (copy-paste, edits nothing but `static/fonts/`).** Set the three variables, run the block:

```bash
FAMILY="Hermit"                  # the display name + CSS family
CATEGORY="mono"                  # sans | serif | display | script | mono
SRC=~/Downloads/Hermit.woff2     # the file you were handed

SLUG="${FAMILY// /}"             # spaces removed, for the license filename
head -c4 "$SRC" | grep -q wOF2 && echo "ok: real woff2" || echo "WARN: not a woff2 (ttf/otf is fine, just bigger)"
cp "$SRC" "static/fonts/$(basename "$SRC")"
python3 - "$SRC" "static/fonts/licenses/${SLUG}-OFL.txt" <<'PY'
import sys
from fontTools.ttLib import TTFont          # already a dev dep in this repo
n = TTFont(sys.argv[1])["name"]
designer = n.getDebugName(9) or n.getDebugName(0)   # 9=designer, fall back to 0=copyright
print("designer  ->", designer)
print("licenseURL->", n.getDebugName(14))           # tells you which SPDX id to use
open(sys.argv[2], "w").write((n.getDebugName(13) or "").strip() + "\n")  # 13=full license text
print("wrote     ->", sys.argv[2])
PY
```

That copies the font, prints the `designer`, and writes the **full** license text the font ships with. Map the printed license URL to an SPDX-ish id for the yaml: SIL OFL → `OFL-1.1`, Apache → `Apache-2.0`, MIT → `MIT`, CC0 → `CC0-1.0`, Ubuntu/GPL+exception → `GPL-2.0 with font exception`. If the license file came out empty (rare, non-OFL fonts), `curl` the project's `LICENSE` into `static/fonts/licenses/${SLUG}-<LICENSE>.txt` instead, and name the filename's suffix to match the id.

**If the file is over ~100 KB, subset it to Latin — just do it, don't ask.** A full-Unicode font ships thousands of glyphs the app never renders; the specimens only show Latin (incl. accented names in the Wikipedia text, curly quotes, and em/en dashes). Latin-subset fonts here land ~15-90 KB. Subset in place (needs `fonttools` + `brotli`: `pip install fonttools brotli`):

```bash
RANGE="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
f="static/fonts/$(basename "$SRC")"   # the file you copied in above
pyftsubset "$f" --output-file="$f.sub" --flavor=woff2 --name-IDs='*' --notdef-outline --unicodes="$RANGE"
mv "$f.sub" "$f"
```

That `RANGE` is Google's `latin` + `latin-ext` (the same coverage Bunny serves), so accented names, smart quotes, and dashes all render. A `WARNING: FFTM NOT subset` line is harmless (a FontForge timestamp table, dropped). Re-subset only the static `.woff2`/`.ttf`/`.otf` files; leave variable fonts (`variable: true`) whole. The `npm test` font-file check in Step 3 confirms the result still parses.

**Then add the `local:` entry** (use the values you just printed):

```yaml
local:
  - family: Hermit
    category: mono # sans | serif | display | script | mono
    files: [Hermit.woff2] # filenames carry the weight/style: -Bold→700, -Italic→italic
    designer: Pablo Caro
    license: OFL-1.1
    url: https://pcaro.es/p/hermit/ # the Visit/Download link
```

Variable font: one file plus `variable: true`. Multiple weights: list every file in `files:`. Filenames that don't spell out their weight: use `faces:` instead (see the by-hand doc).

**Regenerate** (both network-free):

```bash
npm run fonts:local   # read the output: it warns on a missing license file, blank field, or unreferenced file
npm run fonts:names
```

A self-hosted font joins the Game's **Full** bracket automatically. It is never in **Quick** (Google-only), and needs no `featured.ts` edit. Go to Step 3.

---

## Step 2B: Google/Bunny by name

1. Confirm Bunny actually carries it (the generator silently skips names it can't verify):
   ```bash
   curl -s "https://fonts.bunny.net/css?family=$(echo 'Atkinson Hyperlegible Mono' | tr 'A-Z ' 'a-z-')" | head -3
   ```
   A `@font-face` block back means yes. `400` or HTML back means no, use Path A instead.
2. Add the family name under the right group in the `google:` list in `scripts/fonts.yaml` (name only, exact spelling).
3. Run the generator (needs network) and **read its report**:
   ```bash
   npm run fonts:generate
   npm run fonts:names
   ```
   The report tells you what happened: `Extra fonts added`, `Skipped` (misspelled / duplicate / not on Bunny), and any `Reclassified`.

> **Category gotcha (this bit us with Atkinson Hyperlegible Mono).** The generator categorizes by Google's metadata, which is sometimes wrong. Two automatic rewrites in `googleBucket()` (`scripts/fonts-shared.cjs`) correct the common cases, and each prints a line:
>
> - A family whose name ends in **"Mono"** but is tagged Sans Serif/Serif moves to **mono** (`isGoogleMonoCut`).
> - A **single-weight, "Display"-tagged** sans/serif moves to **display** (`isGoogleHeadlineCut`).
>
> So always run Step 3 and confirm the font landed in the bracket you expected. If it did not, and it is a new kind of mislabel (not covered above), fix the rule in `googleBucket()`, not the generated file.

---

## Step 2C: Fontsource into the quiz

Fontsource fonts are already in **Browse** via `npm run fonts:generate`. To promote one into the Game's **Full** bracket, add its exact family name to the right category array in `src/lib/featured.ts`. No generator run needed.

Designers for Fontsource fonts are now backfilled automatically (from each npm package's `metadata.json` `license.attribution`). You do not add them by hand.

---

## Step 3: Verify (every path)

```bash
# 1. It is in the catalog with the category you expect (Hermit example)
grep -o '"Hermit", category: .[a-z]*.' src/lib/fonts.ts             # bunny/fontsource
grep -A3 '"family": "Hermit"' src/lib/localFonts.generated.ts        # self-hosted

# 2. The two gates must pass
npm run check    # 0 type errors (the reliable gate)
npm test         # includes "every font is licensed and credited" — fails the build if
                 # ANY font (any source) is missing a license or designer, plus valid
                 # category/source and no duplicate families
```

`npm test` is the hard gate (it is what CI runs, `.github/workflows/ci.yml`), so a blank `designer`/`license` is a failed build, not just a generate-time warning. If the license/designer test fails, it prints each offender as `Family (source)`.

Then eyeball it: `npm run dev`, open `/<Family>` (the slug route, e.g. `/Hermit`) and Browse. **The specimen must render in the new face, not a system fallback.** For its category the **Full** toggle count ticks up by one (it is `$derived`, so it updates itself; **Quick** is unchanged because a self-hosted or hand-added font is never in the top-24 popularity bracket).

Note on mono weights/styles: the code specimen (`CodePreview.svelte`) only ever renders **italic** (it italicizes comments via `.hljs-comment`); it applies **no bold** to any token. So for a single-weight mono font the comment lines show browser-synthesized italic (a real italic face renders properly), but a **Bold face adds nothing to the specimen** — don't bother adding one for mono. Add a real italic face only if you want true italic comments.

Before committing: `npm run format` (your `fonts.yaml` / `featured.ts` edits are Prettier-checked; generated catalogs are ignored).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Don't know the `designer`/`license` for a self-hosted font | You don't need to guess | Read the font's own name table (Step 2A block): nameID 9 = designer, 13 = full license text, 14 = license URL. Fallback: the copyright line in the project's `LICENSE` |
| Google font never appears after `fonts:generate` | Misspelled, duplicate, or not on Bunny | Read the `Skipped` lines in the report; fix spelling or switch to Path A |
| Font landed in the wrong bracket (e.g. a mono in sans) | Google mislabeled its `category` | Expected if name ends in "Mono" or it is a single-weight Display cut (auto-corrected). Otherwise edit `googleBucket()` in `scripts/fonts-shared.cjs` |
| `fonts:generate` hangs or errors | It needs the network (Google + Bunny + Fontsource + npm) | Run on a real connection; a self-hosted font only needs `fonts:local`, which is network-free |
| Specimen renders in a system font | `@font-face` loaded but the file is bad, or the family name does not match | Open the file in `static/fonts/`; confirm `family:` matches what the app references |
| Every font but the first renders as a fallback | Bunny CSS used repeated `&family=` instead of pipe-join | `src/routes/+layout.svelte` must pipe-join families into one `?family=` list, not repeat `&family=` |
| Mono specimen does not change between fonts | Family set on `<pre>` not `<code>` | `CodePreview.svelte` sets the family inline on `<code class="hljs">` |
| Bold/italic looks wrong (self-hosted) | Browser is faking a missing weight/style | Add the real weight/style file under `files:`/`faces:`. For single-weight pixel fonts this is expected, not a bug |
| `npm test` fails on "licensed and credited" | A font is missing `license` or `designer` | Self-hosted: fill the field in the `local:` entry. Google/Fontsource: add a `DESIGNER_OVERRIDES` entry in `generate-fonts.cjs` and patch the matching `fonts.ts` line |

---

## Rollback / remove a font

- **Self-hosted (yaml):** delete its `local:` entry, run `npm run fonts:local`. Optionally remove its files and license text.
- **Self-hosted (hand-written):** delete the `Font` object from `src/lib/localFonts.ts`.
- **Google/Bunny:** if hand-added, remove the name from `google:`; if it arrived by popularity, add the family to `excluded()` in `scripts/generate-fonts.cjs` (or lower `GTAKE`). Then `npm run fonts:generate`.
- **Fontsource from the quiz:** remove its name from `src/lib/featured.ts` (it stays in Browse).

Discard everything with `git checkout -- src/lib/fonts.ts src/lib/localFonts.generated.ts font-names.txt scripts/fonts.yaml` before any commit.

---

## Network map (why a run hangs)

| Command | Network? | Touches |
| --- | --- | --- |
| `npm run fonts:local` | No | `static/fonts/` + yaml → `localFonts.generated.ts` |
| `npm run fonts:names` | No | catalog → `font-names.txt` |
| `npm run fonts:generate` | **Yes** | Google metadata + Bunny list + Fontsource API + npm `metadata.json` → `fonts.ts` |
| `npm run fonts:all` | **Yes** | runs all three in order |
