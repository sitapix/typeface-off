<script lang="ts">
import type { Font } from '$lib/fonts';
import FontPreview from './FontPreview.svelte';

// Mobile/tablet head-to-head: both fonts fill the screen (top vs bottom), tap
// the half you prefer to pick it. No scrolling, one tap, both visible at once.
// The specimen fills the whole half and is display-only (pointer-events: none)
// so the entire half is the tap target. The only chrome is a small "Tap to
// choose" chip tucked into the window's title-bar strip, clear of the article
// body.
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
      <button
        type="button"
        class="duel-half"
        class:picking={picking === i}
        class:dimmed={picking !== null && picking !== i}
        onclick={(e) => pick(i, e)}
        aria-label={showName ? `Choose ${font.family}` : 'Choose this font'}>
        <FontPreview
          class="duel-specimen"
          family={font.family}
          category={font.category}
          fontSize={fontSize}
          ligatures={ligatures} />

        <span class="duel-cta bg-primary-500 text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          {showName ? font.family : 'Tap to choose'}
        </span>
      </button>
    {/each}
  {/key}
</div>

<style>
.font-duel {
  position: relative;
  display: flex;
  flex: 1 1 0%;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  gap: 0.55rem;
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
  border-radius: 0.6rem;
  -webkit-tap-highlight-color: transparent;
  animation: duel-enter 0.26s ease backwards;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
}
.duel-half:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
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

/* specimen fills the half and is display-only; the half captures the tap */
.duel-half :global(.duel-specimen) {
  height: 100%;
  pointer-events: none;
}

/* compact cue tucked into the window title-bar, right of the URL — out of the
   article body entirely */
.duel-cta {
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  max-width: calc(100% - 1.2rem);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
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
