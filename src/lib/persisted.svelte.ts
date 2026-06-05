/**
 * A localStorage-backed reactive value for Svelte 5 (replaces Skeleton v2's
 * `localStorageStore`). Read/write via `.value`. SSR-safe: falls back to the
 * initial value when `localStorage` is unavailable.
 *
 * Writes through the setter rather than via a persistent `$effect`, so each
 * persisted value costs zero standing effects (no leaked `$effect.root`) and
 * only touches localStorage when it actually changes. All persisted values are
 * primitives, so there's no deep-mutation path to miss.
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

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      value = v;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(v));
      }
    }
  };
}
