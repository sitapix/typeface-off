<script lang="ts">
import type { Font } from '$lib/fonts';
import { Icon, FontLinks } from '$lib';
import { lazyFont } from '$lib/lazyFont';
import { fontFamily, fontFamilyRight, showName } from '$lib/store.svelte';

let { fonts }: { fonts: Font[] } = $props();
</script>

<div class="table-wrap whitespace-nowrap">
  <table class="table">
    <thead>
      <tr>
        <th>Font Family</th>
        <th class="hidden md:table-cell">Preview</th>
        <th>Actions</th>
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
              use:lazyFont={font.family}
              class="block w-full cursor-pointer truncate px-4 py-2 text-left"
              aria-pressed={fontFamily.value === font.family}
              onclick={() => (fontFamily.value = font.family)}
              >{showName.value ? font.family : 'ABC abc 123'}</button>
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
            <FontLinks font={font} />
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
