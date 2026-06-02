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
    <tbody class="[&>tr]:cursor-pointer">
      {#each fonts as font (font.family)}
        <tr
          class="hover:preset-tonal-surface {fontFamily.value === font.family
            ? 'preset-tonal-primary'
            : ''}"
          onclick={() => {
            menuOpen.value = false;
            fontFamily.value = font.family;
          }}>
          <td
            style="font-family: '{font.family}'"
            class="max-w-[9rem] truncate !whitespace-nowrap"
            >{showName.value ? font.family : 'ABC abc 123'}</td>
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
              <a class="btn !p-2 !pl-3" href={font.siteUrl} target="_blank">
                <Icon name="external" size={16} />
              </a>
              <a class="btn !p-2" href={font.downloadUrl}>
                <Icon name="download" size={16} />
              </a>
              <a class="btn !p-2 !pr-3" href="/{slug(font.family)}">
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
