<script lang="ts">
import { sidebarWidth } from '$lib/store.svelte';

// Thin vertical drag handle on the right edge of the desktop sidebar rail. It
// resizes the rail by writing a px width to the shared `sidebarWidth` store; the
// real visual min/max is a CSS clamp() on the rail in AppFrame, so here we only
// keep a loose storage range. lg+ only (hidden on the mobile full-screen drawer).
const DEFAULT = 352;
const STEP = 16;

let handle: HTMLDivElement;
let dragging = $state(false);

// The rail wrapper is the handle's positioned ancestor in AppFrame; measure the
// *rendered* width so a drag continues from the actual edge even at a clamp limit.
function railWidth() {
  return handle.parentElement?.getBoundingClientRect().width ?? DEFAULT;
}

function setWidth(px: number) {
  // Loose storage clamp; the rail's CSS clamp() does the real visual limiting.
  sidebarWidth.value = Math.round(Math.max(200, Math.min(800, px)));
}

function onpointerdown(e: PointerEvent) {
  if (e.button !== 0) return;
  e.preventDefault();
  const startX = e.clientX;
  const startW = railWidth();
  dragging = true;
  try {
    handle.setPointerCapture(e.pointerId);
  } catch {
    // Pointer may already be gone (or synthetic); the listeners below still work.
  }
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  const move = (ev: PointerEvent) => setWidth(startW + (ev.clientX - startX));
  const up = () => {
    dragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
}

function onkeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    setWidth(railWidth() - STEP);
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    setWidth(railWidth() + STEP);
    e.preventDefault();
  }
}
</script>

<!-- A focusable `separator` is the WAI-ARIA window-splitter pattern: it is
     interactive (drag + arrow keys resize), so the non-interactive a11y lints
     don't apply here. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={handle}
  role="separator"
  aria-orientation="vertical"
  aria-label="Resize sidebar"
  aria-valuenow={Math.round(sidebarWidth.value)}
  aria-valuemin={280}
  aria-valuemax={560}
  title="Drag to resize (double-click to reset)"
  tabindex="0"
  class="resize-handle hidden lg:block"
  class:dragging={dragging}
  onpointerdown={onpointerdown}
  onkeydown={onkeydown}
  ondblclick={() => (sidebarWidth.value = DEFAULT)}>
</div>

<style>
.resize-handle {
  position: absolute;
  inset-block: 0;
  right: -6px;
  width: 12px;
  cursor: col-resize;
  z-index: 25;
  touch-action: none;
}
/* Hairline: invisible until hover/focus/drag, then a faint accent line — chrome
   that only shows when you reach for it. */
.resize-handle::after {
  content: '';
  position: absolute;
  inset-block: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: var(--color-primary-500, currentColor);
  opacity: 0;
  transition: opacity 150ms ease;
}
.resize-handle:hover::after,
.resize-handle:focus-visible::after,
.resize-handle.dragging::after {
  opacity: 0.55;
}
.resize-handle:focus-visible {
  outline: none;
}
</style>
