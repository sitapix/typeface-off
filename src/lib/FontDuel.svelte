<script lang="ts">
import type { Font } from '$lib/fonts';
import FontPreview from './FontPreview.svelte';

// Mobile/tablet head-to-head: both fonts fill the screen (top vs bottom), tap
// the half you prefer to pick it. No scrolling, one tap, both visible at once.
// The specimen is display-only (pointer-events: none) so the whole half is the
// tap target.
let {
  players,
  fontSize = 20,
  ligatures = true,
  showName = false,
  onpick
}: {
  players: Font[];
  fontSize?: number;
  ligatures?: boolean;
  showName?: boolean;
  onpick: (player: Font, el: HTMLElement) => void;
} = $props();

let picking = $state<number | null>(null);

// New pair arrived → clear the pick lock so the next round is tappable.
$effect(() => {
  void players;
  picking = null;
});

const pairKey = $derived(players.map((p) => p.family).join('|'));

function pick(i: number, event: MouseEvent) {
  if (picking !== null) return;
  picking = i;
  try {
    navigator.vibrate?.(12);
  } catch {
    /* haptics unsupported — ignore */
  }
  const el = event.currentTarget as HTMLElement;
  // let the winner-flash play briefly before advancing the bracket
  setTimeout(() => onpick(players[i], el), 170);
}
</script>

<div class="font-duel" style="touch-action: manipulation;">
  {#key pairKey}
    {#each players as font, i (font.family)}
      {#if i === 1}
        <div class="duel-vs" aria-hidden="true"><span>VS</span></div>
      {/if}
      <button
        type="button"
        class="duel-half"
        class:picking={picking === i}
        class:dimmed={picking !== null && picking !== i}
        onclick={(e) => pick(i, e)}
        aria-label={showName
          ? `Choose ${font.family}`
          : 'Choose this font'}>
        <FontPreview
          class="duel-specimen"
          family={font.family}
          category={font.category}
          {fontSize}
          {ligatures} />

        {#if showName}
          <span class="duel-name" style="font-family: '{font.family}'"
            >{font.family}</span>
        {/if}

        <span class="duel-cta bg-primary-500 text-white">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          Tap to choose
        </span>
      </button>
    {/each}
  {/key}
</div>

<style>
.font-duel {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 0.6rem;
}

.duel-half {
  position: relative;
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 0.5rem;
  animation: duel-enter 0.26s ease backwards;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
}
.duel-half:nth-of-type(2) {
  animation-delay: 0.06s;
}
.duel-half:active {
  transform: scale(0.985);
}
.duel-half.picking {
  z-index: 5;
  animation: duel-pop 0.34s ease;
}
.duel-half.dimmed {
  opacity: 0.28;
  filter: saturate(0.55);
  transform: scale(0.95);
}

/* specimen is purely visual; the whole half captures the tap */
.duel-half :global(.duel-specimen) {
  height: 100%;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, #000 74%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 74%, transparent 100%);
}

.duel-name {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  z-index: 2;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.15rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  background: color-mix(in srgb, var(--color-surface-50) 80%, transparent);
  backdrop-filter: blur(4px);
}
:global(.dark) .duel-name {
  background: color-mix(in srgb, var(--color-surface-950) 80%, transparent);
}

.duel-cta {
  position: absolute;
  left: 50%;
  bottom: 0.75rem;
  transform: translateX(-50%);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.duel-vs {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 6;
  display: flex;
  height: 2.6rem;
  width: 2.6rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--color-surface-50);
  background: var(--color-surface-950);
  box-shadow: 0 0 0 4px var(--color-surface-50);
}
:global(.dark) .duel-vs {
  color: var(--color-surface-950);
  background: var(--color-surface-50);
  box-shadow: 0 0 0 4px var(--color-surface-950);
}

@keyframes duel-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes duel-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .duel-half,
  .duel-half.picking {
    animation: none !important;
    transition: none !important;
  }
}
</style>
