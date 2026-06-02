<script lang="ts">
import { goto } from '$app/navigation';
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
            <a class="anchor" href="/browse">Browse</a>
            <span aria-hidden="true">&rsaquo;</span>
            <span>{currentFont.family}</span>
          </nav>
          <h2 class="h2">{currentFont.family}</h2>
          <p>{`${currentFont.variants.length} styles`}</p>
          <div class="flex flex-wrap gap-2">
            {#each currentFont.variants as variant (variant)}
              <span class="code">{variant}</span>
            {/each}
          </div>
          <div class="h-64">
            <FontPreview
              family={currentFont.family}
              category={currentFont.category}
              fontSize={18}
              ligatures={ligatures.value} />
          </div>
          <div class="table-wrap !overflow-x-hidden !rounded-none">
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
                    <a class="btn" href={currentFont.siteUrl} target="_blank">
                      <Icon name="external" size={16} />
                      <span class="max-w-[16rem] truncate"
                        >{currentFont.siteUrl}</span>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <hr class="hr" />
      {/if}
      <SearchBar />
      <div class="table-wrap !rounded-none">
        <table class="table !whitespace-nowrap !rounded-none text-left">
          <tbody class="[&>tr]:cursor-pointer">
            {#each fonts as font (font.family)}
              <tr
                class="hover:preset-tonal-surface {currentFont?.family ===
                font.family
                  ? 'preset-tonal-primary'
                  : ''}"
                onclick={() => goto(`/${slug(font.family)}`)}>
                <td
                  style="font-family: '{font.family}'"
                  class="max-w-[9rem] truncate !whitespace-nowrap"
                  >{font.family}</td>
                <td class="hidden md:table-cell">
                  <button
                    class="btn btn-sm preset-outlined-surface-500 {font.family ===
                    fontFamilyRight.value
                      ? 'preset-tonal-primary'
                      : ''}"
                    onclick={(e) => {
                      e.stopPropagation();
                      fontFamilyRight.value = font.family;
                    }}>
                    <Icon name="compare" size={16} />
                    <span>Compare</span>
                  </button>
                </td>
                <td>
                  <div
                    class="btn-group preset-outlined-surface-500 [&>*+*]:border-surface-400-500">
                    <a
                      class="btn !p-2 !pl-3"
                      href={font.siteUrl}
                      target="_blank">
                      <Icon name="external" size={16} />
                    </a>
                    <a class="btn !p-2 !pr-3" href={font.downloadUrl}>
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
      <a class="btn preset-filled-primary-500" href="/browse">Back to Browse</a>
    </div>
  {/if}
</AppFrame>
