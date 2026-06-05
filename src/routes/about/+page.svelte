<script lang="ts">
import { base } from '$app/paths';
import { AppFrame, Header } from '$lib';
import { QUICK_SIZE } from '$lib/roster';
import { CATEGORIES } from '$lib/categories';

let { data } = $props();

// Live numbers so the copy never goes stale as the catalog grows. Deduped by
// family (a self-hosted font overriding a catalog one counts once), matching the
// font-list page.
const familyCount = $derived(new Set(data.fonts.map((f) => f.family)).size);
const categoryNames = CATEGORIES.map((c) => c.label.toLowerCase()).join(', ');
</script>

<svelte:head>
  <title>About · TypefaceOff</title>
  <meta
    name="description"
    content="TypefaceOff is a bracket game for picking a typeface. Every font in it is open-licensed and free to use." />
</svelte:head>

<AppFrame>
  {#snippet header()}
    <Header showMenu={false} />
  {/snippet}

  <div class="bg-surface-50-950">
    <article class="mx-auto max-w-[68ch] px-6 py-12 sm:py-16">
      <h1 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        About TypefaceOff
      </h1>
      <p class="mt-4 text-lg leading-relaxed text-pretty">
        TypefaceOff is a small game for choosing a font. You see two at a time,
        tap the one you like better, and a few rounds later you're down to one.
      </p>

      <h2 class="mt-12 text-lg font-semibold">The fonts are all open source</h2>
      <p class="mt-3 leading-relaxed">
        Every font in the game is open source. Most are under the SIL Open Font
        License; a few are MIT or Apache. All {familyCount} are free to use. Each
        one shows its license and its designer, and links to where you can download
        it.
      </p>

      <h2 class="mt-12 text-lg font-semibold">How it works</h2>
      <p class="mt-3 leading-relaxed">
        You play one category at a time ({categoryNames}). Pick one, then pick a
        size:
      </p>

      <dl
        class="mt-6 divide-y divide-surface-200-800 border-y border-surface-200-800">
        <div class="py-5">
          <dt class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span class="font-semibold">Quick</span>
            <span
              class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium preset-tonal-surface"
              >Top {QUICK_SIZE}</span>
          </dt>
          <dd class="mt-2 leading-relaxed">
            The {QUICK_SIZE} most popular Google Fonts in that category. Fast to play,
            and mostly names you'll know.
          </dd>
        </div>
        <div class="py-5">
          <dt class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span class="font-semibold">Full</span>
            <span
              class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium preset-tonal-surface"
              >Everything + favorites</span>
          </dt>
          <dd class="mt-2 leading-relaxed">
            Those {QUICK_SIZE}, plus self-hosted fonts Google doesn't have and
            some favorites I added by hand. It's bigger and has more of the
            unusual fonts.
          </dd>
        </div>
      </dl>

      <h2 class="mt-12 text-lg font-semibold">The full list</h2>
      <p class="mt-3 leading-relaxed">
        All the font names I used are listed here.
      </p>
      <a
        href="{base}/font-names.html"
        target="_blank"
        rel="noopener noreferrer"
        class="group mt-4 flex items-center justify-between gap-4 rounded-lg border border-surface-200-800 bg-surface-100-900 px-4 py-3 transition-colors hover:border-primary-500">
        <span>
          <span class="font-semibold">Open the font list</span>
          <span class="block text-sm text-surface-800-200"
            >All {familyCount} families, one per line</span>
        </span>
        <span
          class="shrink-0 text-xl text-primary-500 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true">↗</span>
        <span class="sr-only">(opens in a new tab)</span>
      </a>

      <div class="mt-12 flex flex-wrap gap-3">
        <a href="{base}/" class="btn preset-filled-primary-500"
          >Play the game</a>
        <a href="{base}/browse" class="btn preset-tonal-surface"
          >Browse all fonts</a>
      </div>
    </article>
  </div>
</AppFrame>
