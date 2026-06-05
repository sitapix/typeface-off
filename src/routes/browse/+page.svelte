<script lang="ts">
import {
  Header,
  SearchBar,
  FontTable,
  Sidebar,
  Controls,
  FontSizeSlider,
  AppFrame,
  FontPreview,
  FontColumn,
  SpecimenEditor,
  CategoryFilter,
  ListEmptyState,
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
  ligatures,
  editMode,
  DEFAULT_TEXT
} from '$lib/store.svelte';

let { data } = $props();

let selectedCategory = $state<CategoryValue>('all');

const fonts = $derived(
  filterFonts(data.fonts, {
    term: searchTerm.value,
    category: selectedCategory
  })
);

// Edit mode swaps the specimen for the one editable specimen (the SSOT). Mono
// keeps its in-place code editing, so only collapse for text fonts.
const textEditing = $derived(
  editMode.value && getFontByFamily(fontFamily.value)?.category !== 'mono'
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
        <!-- Size is adjustable here too: the top Controls bar is hidden behind
             this drawer, so resize while scrolling the list. -->
        <FontSizeSlider class="mt-3 w-full" />
      {/snippet}
      <SearchBar />
      <CategoryFilter
        class="my-2"
        categories={CATEGORY_FILTERS}
        selected={selectedCategory}
        onselect={(id) => (selectedCategory = id)} />
      {#if fonts.length}
        <FontTable fonts={fonts} />
      {:else}
        <!-- No font matches the search/type filter. Name the miss and hand back
             the two levers that caused it. -->
        <ListEmptyState
          term={searchTerm.value}
          categoryLabel={selectedCategory !== 'all'
            ? CATEGORY_FILTERS.find((c) => c.id === selectedCategory)?.label
            : undefined}
          onclearSearch={() => (searchTerm.value = '')}
          onresetCategory={() => (selectedCategory = 'all')} />
      {/if}
    </Sidebar>
  {/snippet}

  {#snippet pageHeader()}
    <!-- Desktop: the full one-line controls bar. Mobile: the compact bar that
         keeps the swatch row + size visible and tucks the toggles away. -->
    <div class="hidden lg:block">
      <Controls category={selectedCategory} />
    </div>
    <div class="lg:hidden">
      <Controls compact category={selectedCategory} />
    </div>
  {/snippet}

  {#if textEditing}
    <!-- edit mode: the one editable specimen (SSOT); read-only specimens
         elsewhere update live as you type. -->
    <div class="h-full bg-surface-50-950 p-4">
      <h1 class="sr-only">Edit your sample</h1>
      <SpecimenEditor seedHtml={DEFAULT_TEXT} class="h-full" />
    </div>
  {:else}
    <div
      class="grid h-full grid-cols-1 gap-4 bg-surface-50-950 p-4 md:grid-cols-2">
      <h1 class="sr-only">Browse fonts</h1>
      <div
        class="flex flex-col gap-4"
        class:col-span-2={!fontFamilyRight.value}>
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
            onclick={() => (fontFamilyRight.value = '')}
            >Clear comparison</button>
        </div>
      {/if}
    </div>
  {/if}
</AppFrame>
