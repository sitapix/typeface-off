<script lang="ts">
import type { PlacementTier } from './game';
import Logo from './Logo.svelte';

// Shareable "my top fonts" card — the snapshot target for the JPEG export.
// Each font name is set in its own typeface; tiers are bracket placements
// (co-tier fonts tie). Kept opaque (bg-surface) so the exported JPEG isn't
// transparent-on-black.
let {
  tiers,
  categoryLabel = ''
}: { tiers: PlacementTier[]; categoryLabel?: string } = $props();

function medal(place: number): string {
  if (place === 1) return '🥇';
  if (place === 2) return '🥈';
  if (place === 3) return '🥉';
  return `#${place}`;
}
</script>

<div
  class="results-card mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl border border-surface-300-700 bg-surface-50-950 p-6 text-left shadow-lg">
  <div
    class="flex items-baseline justify-between gap-3 border-b border-surface-200-800 pb-3">
    <Logo class="text-2xl" />
    <span class="text-sm opacity-60"
      >My Top Fonts{categoryLabel ? ` · ${categoryLabel}` : ''}</span>
  </div>

  <ol class="flex flex-col gap-3">
    {#each tiers as tier (tier.place)}
      <li class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="w-8 shrink-0 text-center text-lg" aria-hidden="true"
            >{medal(tier.place)}</span>
          <span class="text-xs font-semibold tracking-wide uppercase opacity-60"
            >{tier.label}{tier.fonts.length > 1 ? 's' : ''}</span>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 pl-10">
          {#each tier.fonts as font (font.family)}
            <span class="truncate text-2xl" style="font-family: '{font.family}'"
              >{font.family}</span>
          {/each}
        </div>
      </li>
    {/each}
  </ol>

  <div
    class="border-t border-surface-200-800 pt-2 text-center text-xs opacity-50">
    typeface-off · pick your favorite font
  </div>
</div>
