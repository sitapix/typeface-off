<script lang="ts">
import { base } from '$app/paths';
import {
  Icon,
  Header,
  SearchBar,
  Sidebar,
  FontHeader,
  Controls,
  AppFrame,
  FontPreview
} from '$lib';
import {
  fontSize,
  fontFamilyRight,
  menuOpen,
  searchTerm,
  ligatures
} from '$lib/store.svelte';

let { data } = $props();

let sidebarComponent: { scrollToTop: () => void } | undefined;

const currentFont = $derived(data.font);

const fonts = $derived(
  searchTerm.value
    ? data.fonts.filter((font) =>
        font.family.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    : data.fonts
);

$effect(() => {
  if (currentFont && sidebarComponent) {
    menuOpen.value = true;
    sidebarComponent.scrollToTop();
  }
});

function getFontByFamilyName(familyName: string) {
  return data.fonts.find((font) => font.family === familyName);
}

function slug(family: string) {
  return encodeURIComponent(family.replace(/\s+/g, ''));
}
</script>

<AppFrame>
  {#snippet header()}
    <Header />
  {/snippet}

  {#snippet sidebar()}
    <Sidebar bind:this={sidebarComponent}>
      {#if currentFont}
        <div class="flex flex-col gap-4">
          <nav class="flex items-center gap-2 text-sm">
            <a class="anchor" href="{base}/browse">Browse</a>
            <span aria-hidden="true">&rsaquo;</span>
            <span>{currentFont.family}</span>
          </nav>
          <h1 class="h2">{currentFont.family}</h1>
          <details class="disclosure">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
              <span>{currentFont.variants.length} styles</span>
              <svg
                class="chevron size-4 shrink-0 opacity-60 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div class="mt-2 flex flex-wrap gap-2">
              {#each currentFont.variants as variant (variant)}
                <span class="code">{variant}</span>
              {/each}
            </div>
          </details>
          <div class="h-64">
            <FontPreview
              family={currentFont.family}
              category={currentFont.category}
              fontSize={18}
              ligatures={ligatures.value} />
          </div>
          <details class="disclosure">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
              <span>Download &amp; links</span>
              <svg
                class="chevron size-4 shrink-0 opacity-60 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div class="mt-2 table-wrap !overflow-x-hidden !rounded-none">
              <table class="table !whitespace-nowrap !rounded-none text-left">
                <tbody>
                  <tr>
                    <th>Download URL</th>
                    <td>
                      <a class="btn" href={currentFont.downloadUrl}>
                        <Icon name="download" size={16} />
                        <span class="max-w-[16rem] truncate"
                          >{currentFont.downloadUrl}</span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th>Website URL</th>
                    <td>
                      <a
                        class="btn"
                        href={currentFont.siteUrl}
                        target="_blank"
                        rel="noopener">
                        <Icon name="external" size={16} />
                        <span class="max-w-[16rem] truncate"
                          >{currentFont.siteUrl}</span>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
        <hr class="hr" />
      {/if}
      <SearchBar />
      <div class="table-wrap !rounded-none">
        <table class="table !whitespace-nowrap !rounded-none text-left">
          <tbody>
            {#each fonts as font (font.family)}
              <tr
                class="hover:preset-tonal-surface {currentFont?.family ===
                font.family
                  ? 'preset-tonal-primary'
                  : ''}">
                <td class="max-w-[9rem] !whitespace-nowrap p-0">
                  <a
                    href="{base}/{slug(font.family)}"
                    style="font-family: '{font.family}'"
                    aria-current={currentFont?.family === font.family
                      ? 'page'
                      : undefined}
                    class="block truncate px-3 py-2">{font.family}</a>
                </td>
                <td class="hidden md:table-cell">
                  <button
                    class="btn btn-sm preset-outlined-surface-500 {font.family ===
                    fontFamilyRight.value
                      ? 'preset-tonal-primary'
                      : ''}"
                    aria-pressed={font.family === fontFamilyRight.value}
                    onclick={() => {
                      fontFamilyRight.value = font.family;
                    }}>
                    <Icon name="compare" size={16} />
                    <span>Compare</span>
                  </button>
                </td>
                <td>
                  <div
                    class="btn-group preset-outlined-surface-500 [&>*+*]:border-surface-400-600">
                    <a
                      class="btn !p-2 !pl-3"
                      href={font.siteUrl}
                      target="_blank"
                      rel="noopener"
                      aria-label="Visit {font.family} website">
                      <Icon name="external" size={16} />
                    </a>
                    <a
                      class="btn !p-2 !pr-3"
                      href={font.downloadUrl}
                      aria-label="Download {font.family}">
                      <Icon name="download" size={16} />
                    </a>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Sidebar>
  {/snippet}

  {#snippet pageHeader()}
    <Controls />
  {/snippet}

  {#if currentFont}
    <div
      class="grid h-full grid-cols-1 gap-4 bg-surface-50-950 p-4 md:grid-cols-2">
      <div
        class="flex flex-col gap-4"
        class:col-span-2={!fontFamilyRight.value}>
        <FontHeader font={currentFont} />
        <FontPreview
          class="overflow-hidden rounded-lg"
          fontSize={fontSize.value}
          family={currentFont.family}
          category={currentFont.category}
          ligatures={ligatures.value} />
      </div>
      {#if fontFamilyRight.value}
        <div class="relative hidden flex-col gap-4 md:flex">
          <FontHeader font={getFontByFamilyName(fontFamilyRight.value)} />
          <FontPreview
            class="overflow-hidden rounded-lg"
            fontSize={fontSize.value}
            family={fontFamilyRight.value}
            category={getFontByFamilyName(fontFamilyRight.value)?.category}
            ligatures={ligatures.value} />
          <button
            class="btn preset-filled-surface-500 absolute bottom-10 self-center"
            onclick={() => (fontFamilyRight.value = '')}
            >Clear Comparison</button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="flex h-full flex-col items-center justify-center gap-4 p-8">
      <h2 class="h2">Font not found</h2>
      <a class="btn preset-filled-primary-500" href="{base}/browse"
        >Back to Browse</a>
    </div>
  {/if}
</AppFrame>

<style>
/* Rotate the disclosure chevron when its <details> is open. */
.disclosure[open] .chevron {
  transform: rotate(180deg);
}
</style>
