<script lang="ts">
import type { Font } from '$lib/fonts';
import { Icon } from '$lib';
import {
  fontFamily,
  fontFamilyRight,
  menuOpen,
  showName
} from '$lib/store.svelte';

let { fonts }: { fonts: Font[] } = $props();

function slug(family: string) {
  return encodeURIComponent(family.replace(/\s+/g, ''));
}
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
              style="font-family: '{font.family}'"
              class="block w-full cursor-pointer truncate px-4 py-2 text-left"
              aria-pressed={fontFamily.value === font.family}
              onclick={() => {
                menuOpen.value = false;
                fontFamily.value = font.family;
              }}>{showName.value ? font.family : 'ABC abc 123'}</button>
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
              class="btn-group preset-outlined-surface-500 [&>*+*]:border-surface-400-500">
              <a
                class="btn !p-2 !pl-3"
                href={font.siteUrl}
                target="_blank"
                rel="noopener"
                aria-label="Visit {font.family} website">
                <Icon name="external" size={16} />
              </a>
              <a
                class="btn !p-2"
                href={font.downloadUrl}
                aria-label="Download {font.family}">
                <Icon name="download" size={16} />
              </a>
              <a
                class="btn !p-2 !pr-3"
                href="/{slug(font.family)}"
                aria-label="View {font.family} details">
                <Icon name="maximize" size={16} />
              </a>
            </div>
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
