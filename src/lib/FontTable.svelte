<script lang="ts">
import type { Font } from '$lib/fonts';
import { Icon, FontLinks } from '$lib';
import { lazyFont } from '$lib/lazyFont';
import { fontFamily, fontFamilyRight, showName } from '$lib/store.svelte';

let { fonts }: { fonts: Font[] } = $props();
</script>

<!-- table-fixed + w-full pins the table to the (narrow) sidebar rail so it can
     never out-grow it and force a horizontal scrollbar; the family name truncates
     and the two action columns are sized to fit compact icon buttons. -->
<div class="table-wrap">
  <table class="table w-full table-fixed">
    <thead>
      <tr>
        <th>Font Family</th>
        <th class="hidden w-11 md:table-cell">Preview</th>
        <th class="w-36">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each fonts as font (font.family)}
        <tr
          class="hover:preset-tonal-surface {fontFamily.value === font.family
            ? 'preset-tonal-primary'
            : ''}">
          <td class="max-w-[9rem] !whitespace-nowrap p-0">
            <button
              type="button"
              {@attach lazyFont(font.family)}
              class="block w-full cursor-pointer truncate px-4 py-2 text-left"
              aria-pressed={fontFamily.value === font.family}
              onclick={() => (fontFamily.value = font.family)}
              >{showName.value ? font.family : 'ABC abc 123'}</button>
          </td>
          <td class="hidden px-0 text-center md:table-cell">
            <button
              class="btn-icon btn-icon-sm preset-outlined-surface-500 {font.family ===
              fontFamilyRight.value
                ? 'preset-tonal-primary'
                : ''}"
              aria-pressed={font.family === fontFamilyRight.value}
              aria-label="Compare {font.family} on the right"
              onclick={() => {
                fontFamilyRight.value = font.family;
              }}>
              <Icon name="compare" size={16} />
            </button>
          </td>
          <td class="px-0">
            <FontLinks
              font={font}
              size={16}
              groupClass="preset-outlined-surface-500 [&>*+*]:border-surface-400-600 [&_.btn]:px-2" />
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th colspan="1">Total</th>
        <td colspan="2">{fonts.length} fonts</td>
      </tr>
    </tfoot>
  </table>
</div>
