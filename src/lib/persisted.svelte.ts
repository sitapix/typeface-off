/**
 * A localStorage-backed reactive value for Svelte 5 (replaces Skeleton v2's
 * `localStorageStore`). Read/write via `.value`. SSR-safe: falls back to the
 * initial value when `localStorage` is unavailable.
 */
export function persisted<T>(key: string, initial: T) {
  let value = $state<T>(initial);

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        value = JSON.parse(stored) as T;
      } catch {
        // malformed entry — keep the initial value
      }
    }
  }

  $effect.root(() => {
    $effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
  });

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      value = v;
    }
  };
}
