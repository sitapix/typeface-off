<script lang="ts">
import { base } from '$app/paths';
import {
  Icon,
  Header,
  SearchBar,
  Sidebar,
  Controls,
  AppFrame,
  FontPreview,
  FontColumn,
  FontLinks,
  getFontByFamily
} from '$lib';
import { fontSlug } from '$lib/slug';
import {
  fontSize,
  fontFamilyRight,
  menuOpen,
  searchTerm,
  ligatures,
  previewText
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
              <Icon
                name="chevron"
                size={16}
                class="chevron shrink-0 opacity-60 transition-transform" />
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
              ligatures={ligatures.value}
              text={previewText.value} />
          </div>
          <details class="disclosure">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
              <span>Download &amp; links</span>
              <Icon
                name="chevron"
                size={16}
                class="chevron shrink-0 opacity-60 transition-transform" />
            </summary>
            <div class="mt-2 table-wrap !overflow-x-hidden !rounded-none">
              <table class="table !whitespace-nowrap !rounded-none text-left">
                <tbody>
                  {#if currentFont.designer}
                    <tr>
                      <th>Designer</th>
                      <td>{currentFont.designer}</td>
                    </tr>
                  {/if}
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
                    href="{base}/{fontSlug(font.family)}"
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
                  <FontLinks font={font} details={false} />
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
        <FontColumn
          font={currentFont}
          fontSize={fontSize.value}
          ligatures={ligatures.value}
          editable />
      </div>
      {#if fontFamilyRight.value}
        <div class="relative hidden flex-col gap-4 md:flex">
          <FontColumn
            font={getFontByFamily(fontFamilyRight.value)}
            fontSize={fontSize.value}
            ligatures={ligatures.value}
            text={previewText.value} />
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
.disclosure[open] :global(.chevron) {
  transform: rotate(180deg);
}
</style>
