<script lang="ts">
import type { Snippet } from 'svelte';
import { Switch } from '@skeletonlabs/skeleton-svelte';

// A labelled on/off toggle wrapping Skeleton's Switch. skeleton-svelte's parts
// are headless (no default styling in this version), so the track/thumb classes
// here ARE the switch's appearance. Structure follows the canonical Skeleton
// example: Control > Thumb, then Label, then HiddenInput. The binary specimen
// settings (Show Name, Ligatures, Edit) share this so it lives in one place.
// Pass `label` for plain text, or `children` for richer content (e.g. an icon).
// `description` adds a muted helper line under the label — the plain-language
// "what this does / why you'd flip it" that a bare label can't carry.
let {
  checked = $bindable(false),
  label,
  description,
  title,
  children
}: {
  checked?: boolean;
  label?: string;
  description?: string;
  title?: string;
  children?: Snippet;
} = $props();
</script>

<Switch
  checked={checked}
  onCheckedChange={(e) => (checked = e.checked)}
  class="flex cursor-pointer select-none items-start gap-2.5"
  title={title}>
  <Switch.Control
    class="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-surface-300-700 p-0.5 transition-colors focus-within:ring-2 focus-within:ring-primary-500/50 data-[state=checked]:bg-primary-500">
    <Switch.Thumb
      class="size-4 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4" />
  </Switch.Control>
  <span class="flex min-w-0 flex-col gap-0.5">
    <Switch.Label class="leading-tight">
      {#if children}{@render children()}{:else}{label}{/if}
    </Switch.Label>
    {#if description}
      <span class="text-xs leading-snug text-surface-800-200"
        >{description}</span>
    {/if}
  </span>
  <Switch.HiddenInput />
</Switch>
