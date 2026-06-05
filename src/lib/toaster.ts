import { createToaster } from '@skeletonlabs/skeleton-svelte';

// App-wide toaster singleton (Skeleton's Toast acts as a singleton — one shared
// store drives a single <Toast.Group>, mounted once in +layout.svelte). Trigger
// messages from anywhere via toaster.success(...) / .error(...) / .info(...).
// bottom-end keeps them clear of the bottom-center action buttons on the results
// screen and the mobile duel toolbar.
export const toaster = createToaster({ placement: 'bottom-end' });
