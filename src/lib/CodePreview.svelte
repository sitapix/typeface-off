<script lang="ts">
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

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

// The original Coding Font sample — exercises 0/o/O, l/1/I, operators, and the
// ligature-forming sequences (=>, ===, <=, !=) that coding fonts are judged on.
const CODE = `// This is a single-line comment example

/*
This is a multi-line comment example
Demonstrating various JavaScript syntax and elements
*/

// Defining a function using arrow function syntax
const isMultipleOf = (number, multiple) => {
  if (number === 0) {
    console.log('0 is a neutral element.');
    return;
  }

  for (let i = 1; i <= 10; i++) {
    if ((number * i) % multiple === 0) {
      console.log(number * i + ' is a multiple of ' + multiple);
    } else {
      console.log(number * i + ' is not a multiple');
    }
  }
};

// Distinguishing between 0, o, O, l, 1, I
let oO0 = 0; // Zero
let l1I = 1; // One

isMultipleOf(oO0, l1I); // => related to zero
isMultipleOf(l1I, oO0); // => related to one`;

// Highlighted once at module/import time — deterministic, so SSR and client
// markup match (no hydration mismatch).
const highlighted = hljs.highlight(CODE, { language: 'javascript' }).value;

const ligCss = $derived(
  ligatures
    ? 'font-variant-ligatures: contextual; font-feature-settings: "calt" 1, "liga" 1;'
    : 'font-variant-ligatures: none; font-feature-settings: "calt" 0, "liga" 0;'
);
</script>

<div
  class="code-preview flex h-full w-full flex-col overflow-hidden rounded-lg border border-[#2a2a2a] shadow-lg {className}">
  <!-- editor chrome -->
  <div class="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#252526] px-4 py-3">
    <span class="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
    <span class="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
    <span class="h-3 w-3 rounded-full bg-[#27c93f]"></span>
    <span class="ml-2 text-sm text-[#9da5b4]">example.js</span>
  </div>

  <!-- code body -->
  <pre
    class="m-0 flex-1 overflow-auto bg-[#1e1e1e] p-5 leading-relaxed text-[#d4d4d4]"
    style="font-family: '{fontFamily}', monospace; font-size: {fontSize}px; {ligCss}"><code
      class="hljs">{@html highlighted}</code></pre>
</div>

<style>
:global(.code-preview .hljs-comment) {
  color: #6a9955;
  font-style: italic;
}
:global(.code-preview .hljs-keyword),
:global(.code-preview .hljs-literal) {
  color: #569cd6;
}
:global(.code-preview .hljs-string) {
  color: #ce9178;
}
:global(.code-preview .hljs-number) {
  color: #b5cea8;
}
:global(.code-preview .hljs-title),
:global(.code-preview .hljs-title.function_) {
  color: #dcdcaa;
}
:global(.code-preview .hljs-params) {
  color: #9cdcfe;
}
:global(.code-preview .hljs-built_in) {
  color: #4ec9b0;
}
:global(.code-preview .hljs-variable),
:global(.code-preview .hljs-attr) {
  color: #9cdcfe;
}
</style>
