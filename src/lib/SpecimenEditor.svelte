<script lang="ts">
// The one editable specimen (the SSOT composer). Shown in place of the text
// specimen(s) while edit mode is on: a single Tiptap (rich-text) instance,
// seeded with whatever the specimen was showing (the curated lead, or your prior
// copy). What you type here writes the shared `previewText`, so every specimen —
// both duel halves, every later round, Browse and detail — renders it in its own
// font. Edit it once, it's everywhere.
//
// Tiptap is heavy + client-only, so it's dynamically imported in onMount (kept
// out of SSR/prerender and the initial bundle, same discipline as Shiki). The
// schema is locked to paragraph/heading(1–2)/bold/italic so pasted or shortcut
// content can't introduce anything the read-only specimens don't style.
import { onMount } from 'svelte';
import {
  previewText,
  editMode,
  specimenScheme,
  DEFAULT_TEXT,
  isCustomPreview
} from '$lib/store.svelte';
import { schemeAt } from '$lib/specimenSchemes';
import Icon from './Icon.svelte';

let {
  /** Curated fallback to seed from when nothing custom is written yet. */
  seedHtml = DEFAULT_TEXT,
  class: className = ''
}: {
  seedHtml?: string;
  class?: string;
} = $props();

const scheme = $derived(schemeAt(specimenScheme.value));

let host = $state<HTMLDivElement>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let editor = $state<any>(null);
let active = $state({ bold: false, italic: false, h1: false, h2: false });

function refreshActive() {
  if (!editor) return;
  active = {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    h1: editor.isActive('heading', { level: 1 }),
    h2: editor.isActive('heading', { level: 2 })
  };
}

onMount(() => {
  let destroyed = false;
  let ed: { destroy: () => void } | null = null;

  (async () => {
    const { Editor } = await import('@tiptap/core');
    const { default: StarterKit } = await import('@tiptap/starter-kit');
    if (destroyed || !host) return;

    // Seed from your own copy if you have one, else the curated text on screen.
    const seed = isCustomPreview(previewText.value)
      ? previewText.value
      : seedHtml;

    editor = new Editor({
      element: host,
      content: seed,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2] },
          // keep the schema to heading/paragraph/bold/italic only
          bulletList: false,
          orderedList: false,
          listItem: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          code: false,
          strike: false,
          link: false,
          underline: false
        })
      ],
      editorProps: {
        attributes: {
          class: 'tt-content',
          'aria-label': 'Edit your sample text',
          spellcheck: 'false'
        }
      },
      onUpdate: ({ editor }) => {
        previewText.value = editor.getHTML();
      },
      onTransaction: refreshActive
    });
    ed = editor;
    refreshActive();
    editor.commands.focus('end');
  })();

  return () => {
    destroyed = true;
    ed?.destroy();
    editor = null;
  };
});

function reset() {
  previewText.value = DEFAULT_TEXT;
  editor?.commands.setContent(seedHtml);
  editor?.commands.focus('end');
  refreshActive();
}
</script>

<div
  class="specimen-editor flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg {className}"
  style="--ground:{scheme.bg}; --ink:{scheme.fg};">
  <!-- toolbar (neutral UI chrome, not the specimen) -->
  <div class="se-toolbar flex items-center gap-1 px-3 py-2">
    <button
      type="button"
      class="se-btn"
      class:active={active.bold}
      aria-pressed={active.bold}
      title="Bold (⌘B)"
      aria-label="Bold"
      onclick={() => editor?.chain().focus().toggleBold().run()}>
      <Icon name="bold" size={14} />
    </button>
    <button
      type="button"
      class="se-btn"
      class:active={active.italic}
      aria-pressed={active.italic}
      title="Italic (⌘I)"
      aria-label="Italic"
      onclick={() => editor?.chain().focus().toggleItalic().run()}>
      <Icon name="italic" size={14} />
    </button>
    <span class="se-sep" aria-hidden="true"></span>
    <button
      type="button"
      class="se-btn"
      class:active={active.h1}
      aria-pressed={active.h1}
      title="Heading"
      aria-label="Heading"
      onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
      H1
    </button>
    <button
      type="button"
      class="se-btn"
      class:active={active.h2}
      aria-pressed={active.h2}
      title="Subheading"
      aria-label="Subheading"
      onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
      H2
    </button>

    <div class="ml-auto flex items-center gap-1">
      <button
        type="button"
        class="se-btn se-text"
        title="Reset to the default sample"
        aria-label="Reset to the default sample"
        onclick={reset}>
        <Icon name="reset" size={14} />
        Reset
      </button>
      <button
        type="button"
        class="se-done"
        onclick={() => (editMode.value = false)}>Done</button>
    </div>
  </div>

  <!-- the editable surface; Tiptap mounts its ProseMirror here -->
  <div class="se-body flex-1 overflow-auto px-6 py-5" bind:this={host}></div>
</div>

<style>
.specimen-editor {
  position: relative;
  background: var(--ground);
  color: var(--ink);
  border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
}
.se-toolbar {
  background: color-mix(in srgb, var(--ink) 6%, var(--ground));
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    sans-serif;
}
.se-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 1.9rem;
  height: 1.9rem;
  justify-content: center;
  padding: 0 0.45rem;
  border-radius: 0.4rem;
  color: var(--ink);
  opacity: 0.7;
  font-size: 0.85rem;
  transition:
    opacity 0.12s ease,
    background-color 0.12s ease;
}
.se-btn:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--ink) 10%, transparent);
}
.se-btn.active {
  opacity: 1;
  background: color-mix(in srgb, var(--ink) 16%, transparent);
}
.se-btn.se-text {
  font-size: 0.75rem;
}
.se-btn:focus-visible,
.se-done:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
}
.se-sep {
  width: 1px;
  height: 1.1rem;
  margin: 0 0.25rem;
  background: color-mix(in srgb, var(--ink) 20%, transparent);
}
.se-done {
  height: 1.9rem;
  padding: 0 0.8rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--ink) 88%, var(--ground));
  color: var(--ground);
}
/* Editable surface. Composed in a clean, legible UI font (you judge the actual
   typefaces in the specimens once you're done) on the scheme ground/ink. */
.se-body {
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 1.05rem;
  line-height: 1.5;
}
.se-body :global(.tt-content) {
  outline: none;
  min-height: 100%;
}
.se-body :global(.tt-content:focus) {
  outline: none;
}
.se-body :global(h1) {
  font-weight: 700;
  font-size: 1.9em;
  line-height: 1.1;
  margin: 0 0 0.2em;
}
.se-body :global(h2) {
  font-weight: 700;
  font-size: 1.4em;
  line-height: 1.2;
  margin: 0.4em 0 0.2em;
}
.se-body :global(p) {
  margin: 0 0 0.5em;
}
.se-body :global(strong) {
  font-weight: 700;
}
.se-body :global(em) {
  font-style: italic;
}
/* Placeholder caret colour from the scheme ink. */
.se-body :global(.tt-content) {
  caret-color: var(--ink);
}

/* Touch: grow the composer toolbar buttons to a 44px target on coarse pointers.
   They sit in a row (like the swatch picker), so the button itself grows; the
   pointer-fine desktop keeps the compact ~1.9rem chrome. */
@media (pointer: coarse) {
  .se-btn {
    min-width: 44px;
    height: 44px;
  }
  .se-done {
    height: 44px;
  }
}
</style>
