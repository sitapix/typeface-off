<script lang="ts">
// The mono specimen: a real, typeable code editor. A transparent <textarea>
// sits over a Shiki-highlighted <pre> (the classic overlay technique) so you can
// drop in your own code and judge a coding font on it. The text lives in the
// shared, persisted `codeSample` store, so both Game-duel panels show the same
// code (only the typeface differs) and edits stay in sync everywhere.
//
// Shiki is async and the site is statically prerendered, so we render a plain
// (escaped) fallback for SSR/first paint and upgrade to the highlighted output
// after mount via a browser-only dynamic import (keeps Shiki out of the prerender
// and the initial bundle, same discipline as snapdom).
import { tick } from 'svelte';
import { codeSample, editMode, codeTheme } from '$lib/store.svelte';
import { DEFAULT_CODE } from '$lib/codeSample';
import { codeThemeById } from '$lib/codeThemes';
import Icon from './Icon.svelte';

let {
  fontFamily = 'JetBrains Mono',
  fontSize = 16,
  ligatures = true,
  class: className = ''
}: {
  fontFamily?: string;
  fontSize?: number;
  ligatures?: boolean;
  class?: string;
} = $props();

// Editability is the global edit mode: off = read-only (so the duel half stays
// tap-to-pick), on = typeable.
const editable = $derived(editMode.value);

// Selected Shiki theme; the editor surface (bg/gutter/chrome/border) is derived
// from its bg+fg, so the whole editor re-skins — not just the syntax colours.
const theme = $derived(codeThemeById(codeTheme.value));

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Deterministic plain-text fallback. Seeded from the constant DEFAULT_CODE (not
// the persisted value, which differs once localStorage kicks in) so SSR and the
// first client render are identical — no `{@html}` hydration mismatch. The effect
// below swaps in the real Shiki output for the live `codeSample` on mount.
let highlightedHtml = $state(
  `<pre class="shiki" tabindex="-1" style="background-color:transparent;color:var(--code-fg)"><code>${escapeHtml(DEFAULT_CODE)}</code></pre>`
);

const lineCount = $derived(codeSample.value.split('\n').length);
const lineNumbers = $derived(
  Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')
);
const gutterDigits = $derived(String(lineCount).length);

const ligCss = $derived(
  ligatures
    ? 'font-variant-ligatures: contextual; font-feature-settings: "calt" 1, "liga" 1;'
    : 'font-variant-ligatures: none; font-feature-settings: "calt" 0, "liga" 0;'
);

let taEl = $state<HTMLTextAreaElement>();
let hlEl = $state<HTMLDivElement>();
let gutterEl = $state<HTMLPreElement>();

// Textarea is the only user-facing scroller; mirror it onto the (clipped)
// highlight layer (both axes) and the gutter (vertical only — it stays put
// horizontally, like a sticky column).
function syncScroll() {
  if (!taEl) return;
  if (hlEl) {
    hlEl.scrollTop = taEl.scrollTop;
    hlEl.scrollLeft = taEl.scrollLeft;
  }
  if (gutterEl) gutterEl.scrollTop = taEl.scrollTop;
}

// Re-highlight (browser only — effects don't run during SSR), debounced to a
// frame so rapid typing doesn't fire a Shiki pass per keystroke. The transparent
// textarea already shows the new text instantly, so the caret stays responsive;
// the colours catch up a frame later.
let raf = 0;
$effect(() => {
  const code = codeSample.value; // tracked dependency
  const themeId = codeTheme.value; // re-highlight when the theme changes too
  let cancelled = false;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(async () => {
    const { highlight } = await import('./shikiHighlighter');
    const html = await highlight(code, themeId);
    if (cancelled) return;
    highlightedHtml = html;
    await tick();
    if (!cancelled) syncScroll();
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
});

function onKeydown(e: KeyboardEvent) {
  if (!editable || !taEl) return;
  // Escape leaves the editor so keyboard users aren't trapped by the Tab handler.
  if (e.key === 'Escape') {
    taEl.blur();
    return;
  }
  // Tab inserts two spaces (matches tab-size) instead of moving focus.
  if (e.key === 'Tab') {
    e.preventDefault();
    const { selectionStart: start, selectionEnd: end } = taEl;
    codeSample.value =
      codeSample.value.slice(0, start) + '  ' + codeSample.value.slice(end);
    tick().then(() => {
      if (taEl) taEl.selectionStart = taEl.selectionEnd = start + 2;
    });
  }
}
</script>

<div
  class="code-preview flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg {className}"
  style="--specimen-font: '{fontFamily}', monospace; --code-bg: {theme.bg}; --code-fg: {theme.fg}; --gutter-w: calc({gutterDigits}ch + 1.95rem); {ligCss}">
  <!-- editor chrome -->
  <div class="chrome flex items-center gap-2 px-4 py-3">
    <span class="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
    <span class="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
    <span class="h-3 w-3 rounded-full bg-[#27c93f]"></span>
    <span class="chrome-title ml-2 text-sm">example.js</span>
    {#if editable}
      <button
        type="button"
        class="chrome-btn ml-auto inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs"
        title="Reset code to the default sample"
        aria-label="Reset code to the default sample"
        disabled={codeSample.value === DEFAULT_CODE}
        onclick={() => (codeSample.value = DEFAULT_CODE)}>
        <Icon name="reset" size={14} />
        Reset
      </button>
    {/if}
  </div>

  <!-- editor body: a sticky line-number gutter + a Shiki highlight layer with a
       transparent textarea on top. They share font/size/line-height/padding so
       the caret lands exactly over the highlighted glyphs. -->
  <div
    class="editor relative flex-1 overflow-hidden"
    style="font-size: {fontSize}px;">
    <pre
      bind:this={gutterEl}
      class="ln-gutter"
      aria-hidden="true">{lineNumbers}</pre>

    <div bind:this={hlEl} class="hl-layer" aria-hidden="true">
      {@html highlightedHtml}
    </div>

    <textarea
      bind:this={taEl}
      bind:value={codeSample.value}
      onscroll={syncScroll}
      onkeydown={onKeydown}
      readonly={!editable}
      tabindex={editable ? 0 : -1}
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      wrap="off"
      aria-label="Editable code sample"
      class="input-layer"></textarea>
  </div>
</div>

<style>
/* Whole editor surface derives from the active theme's --code-bg / --code-fg
   (set inline from CODE_THEMES), so picking a Shiki theme re-skins the frame —
   not just the syntax. Nothing here is a fixed colour. */
.code-preview {
  border: 1px solid color-mix(in srgb, var(--code-fg) 16%, transparent);
}
.chrome {
  background: color-mix(in srgb, var(--code-fg) 5%, var(--code-bg));
  border-bottom: 1px solid color-mix(in srgb, var(--code-fg) 12%, transparent);
}
.chrome-title {
  color: color-mix(in srgb, var(--code-fg) 55%, transparent);
}
.chrome-btn {
  position: relative;
  color: color-mix(in srgb, var(--code-fg) 55%, transparent);
  transition:
    color 0.12s ease,
    background-color 0.12s ease;
}
.chrome-btn:hover {
  color: var(--code-fg);
  background: color-mix(in srgb, var(--code-fg) 10%, transparent);
}
.chrome-btn:disabled {
  opacity: 0.4;
}
.chrome-btn:disabled:hover {
  background: transparent;
  color: color-mix(in srgb, var(--code-fg) 55%, transparent);
}
/* Touch: the Reset button sits alone in a slim chrome bar, so extend its tap
   area to 44px tall with a transparent overlay rather than growing the button
   (which would balloon the bar). The overlay is part of the button, so it's
   clickable; nothing sits beside it to overlap. */
@media (pointer: coarse) {
  .chrome-btn::before {
    content: '';
    position: absolute;
    inset: 50% 0 auto 0;
    height: 44px;
    transform: translateY(-50%);
  }
}

.editor {
  line-height: 1.6;
  background: var(--code-bg);
}

/* line-number gutter: neutral mono in its own column; mirrors only vertical
   scroll, so it behaves like a sticky left column. */
.ln-gutter {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--gutter-w);
  z-index: 2;
  margin: 0;
  padding: 1.1rem 0.85rem 1.1rem 1.1rem;
  overflow: hidden;
  text-align: right;
  white-space: pre;
  color: color-mix(in srgb, var(--code-fg) 40%, transparent);
  background: var(--code-bg);
  border-right: 1px solid color-mix(in srgb, var(--code-fg) 12%, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-variant-numeric: tabular-nums;
  user-select: none;
  pointer-events: none;
}

/* highlighted code, clipped; scrolled programmatically to mirror the textarea */
.hl-layer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--gutter-w);
  right: 0;
  overflow: hidden;
  pointer-events: none;
}
.hl-layer :global(pre.shiki) {
  margin: 0;
  padding: 1.1rem 1.5rem 1.1rem 1rem;
  min-width: 100%;
  width: max-content;
  min-height: 100%;
  white-space: pre;
  tab-size: 2;
  line-height: 1.6;
  background: transparent !important; /* the .editor provides --code-bg */
}
/* Tailwind Preflight's `code { font-family: <mono> }` beats a merely inherited
   family, so set the specimen font on the shiki <pre> AND its <code>; the
   coloured spans then inherit it. (Same gotcha the old hljs markup had.) */
.hl-layer :global(pre.shiki),
.hl-layer :global(pre.shiki code) {
  font-family: var(--specimen-font);
}

/* transparent input on top: invisible text, visible caret, identical metrics */
.input-layer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--gutter-w);
  right: 0;
  z-index: 3;
  margin: 0;
  padding: 1.1rem 1.5rem 1.1rem 1rem;
  border: 0;
  outline: none;
  resize: none;
  overflow: auto;
  white-space: pre;
  tab-size: 2;
  line-height: 1.6;
  font-family: var(--specimen-font);
  font-size: inherit;
  background: transparent;
  color: transparent;
  caret-color: var(--code-fg);
}
.input-layer::selection {
  background: color-mix(in srgb, var(--code-fg) 25%, transparent);
}
.input-layer[readonly] {
  caret-color: transparent;
  /* Game (edit mode off): the mono editor is a display-only specimen, like every
     other specimen. It must not capture pointer or keyboard focus, or the duel's
     arrow-key / Choose picking gets hijacked — clicking into the code and then
     pressing an arrow would blow through rounds instead of doing nothing. Becomes
     interactive again when edit mode makes it typeable (no longer readonly). */
  pointer-events: none;
}
/* keyboard-visible focus on the whole editor (the textarea's own outline is off) */
.code-preview:focus-within {
  outline: 2px solid color-mix(in srgb, var(--code-fg) 45%, transparent);
  outline-offset: -1px;
}
</style>
