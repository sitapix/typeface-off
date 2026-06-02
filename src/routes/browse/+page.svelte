<script lang="ts">
import {
  Header,
  SearchBar,
  FontTable,
  Sidebar,
  FontHeader,
  Controls,
  AppFrame,
  FontPreview
} from '$lib';
import { filterFonts } from '$lib/filterFonts';
import {
  fontSize,
  fontFamily,
  fontFamilyRight,
  searchTerm,
  ligatures
} from '$lib/store.svelte';

let { data } = $props();

let selectedCategory = $state<
  'all' | 'sans' | 'serif' | 'display' | 'script' | 'mono'
>('all');

const categories = [
  { id: 'all', label: 'All' },
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'script', label: 'Script' },
  { id: 'mono', label: 'Mono' }
] as const;

const fonts = $derived(
  filterFonts(data.fonts, {
    term: searchTerm.value,
    category: selectedCategory
  })
);

function getFontByFamilyName(familyName: string) {
  return data.fonts.find((font) => font.family === familyName);
}
</script>

<AppFrame>
  {#snippet header()}
    <Header />
  {/snippet}

  {#snippet sidebar()}
    <Sidebar>
      {#snippet pinned()}
        <!-- Live preview of the selected font, kept in view while you scroll the
             list. The full-size preview lives in the main area (drawer closed). -->
        <div class="h-40">
          <FontPreview
            class="overflow-hidden rounded-lg"
            fontSize={fontSize.value}
            family={fontFamily.value}
            category={getFontByFamilyName(fontFamily.value)?.category}
            ligatures={ligatures.value} />
        </div>
      {/snippet}
      <SearchBar />
      <div class="my-2 flex flex-wrap gap-1">
        {#each categories as category (category.id)}
          <button
            class="btn btn-sm {selectedCategory === category.id
              ? 'preset-filled-primary-500'
              : 'preset-outlined-surface-500'}"
            aria-pressed={selectedCategory === category.id}
            onclick={() => (selectedCategory = category.id)}
            >{category.label}</button>
        {/each}
      </div>
      <FontTable fonts={fonts} />
    </Sidebar>
  {/snippet}

  {#snippet pageHeader()}
    <Controls />
  {/snippet}

  <div
    class="grid h-full grid-cols-1 gap-4 bg-surface-50-950 p-4 md:grid-cols-2">
    <h1 class="sr-only">Browse fonts</h1>
    <div class="flex flex-col gap-4" class:col-span-2={!fontFamilyRight.value}>
      <FontHeader font={getFontByFamilyName(fontFamily.value)} />
      <FontPreview
        class="overflow-hidden rounded-lg"
        fontSize={fontSize.value}
        family={fontFamily.value}
        category={getFontByFamilyName(fontFamily.value)?.category}
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
          class="btn preset-filled-surface-500 absolute bottom-4 self-center"
          onclick={() => (fontFamilyRight.value = '')}>Clear Comparison</button>
      </div>
    {/if}
  </div>
</AppFrame>
