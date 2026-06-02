<script lang="ts">
import {
  Header,
  SearchBar,
  FontTable,
  Sidebar,
  Controls,
  AppFrame,
  FontPreview,
  FontColumn,
  CategoryFilter,
  getFontByFamily
} from '$lib';
import { filterFonts } from '$lib/filterFonts';
import {
  CATEGORY_FILTERS,
  type CategoryFilter as CategoryValue
} from '$lib/categories';
import {
  fontSize,
  fontFamily,
  fontFamilyRight,
  searchTerm,
  ligatures
} from '$lib/store.svelte';

let { data } = $props();

let selectedCategory = $state<CategoryValue>('all');

const fonts = $derived(
  filterFonts(data.fonts, {
    term: searchTerm.value,
    category: selectedCategory
  })
);
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
            category={getFontByFamily(fontFamily.value)?.category}
            ligatures={ligatures.value} />
        </div>
      {/snippet}
      <SearchBar />
      <CategoryFilter
        class="my-2"
        categories={CATEGORY_FILTERS}
        selected={selectedCategory}
        onselect={(id) => (selectedCategory = id)} />
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
      <FontColumn
        font={getFontByFamily(fontFamily.value)}
        fontSize={fontSize.value}
        ligatures={ligatures.value} />
    </div>
    {#if fontFamilyRight.value}
      <div class="relative hidden flex-col gap-4 md:flex">
        <FontColumn
          font={getFontByFamily(fontFamilyRight.value)}
          fontSize={fontSize.value}
          ligatures={ligatures.value} />
        <button
          class="btn preset-filled-surface-500 absolute bottom-4 self-center"
          onclick={() => (fontFamilyRight.value = '')}>Clear Comparison</button>
      </div>
    {/if}
  </div>
</AppFrame>
