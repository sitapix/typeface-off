/**
 * Svelte action: lazily apply a font to an element only when it scrolls into
 * view, so a long list of specimens (Browse table, Game bracket) downloads each
 * font's woff2 only when it's actually visible — not all at once.
 *
 * Until the element intersects the viewport it inherits the surrounding font;
 * on intersection we set `font-family`, which is what triggers the browser to
 * fetch that font. `font-display: swap` then swaps it in. `rootMargin` starts
 * the fetch slightly before the element is on screen to avoid a visible flash.
 *
 * Falls back to applying immediately where IntersectionObserver is unavailable
 * (older browsers / SSR is a no-op since actions are client-only).
 */
export function lazyFont(node: HTMLElement, family: string) {
  let fam = family;
  let applied = false;

  const apply = () => {
    node.style.fontFamily = `'${fam}', sans-serif`;
    applied = true;
  };

  if (typeof IntersectionObserver === 'undefined') {
    apply();
    return {
      update(next: string) {
        fam = next;
        apply();
      },
      destroy() {}
    };
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        apply();
        io.disconnect();
      }
    },
    { rootMargin: '300px 0px' }
  );
  io.observe(node);

  return {
    update(next: string) {
      fam = next;
      if (applied) apply(); // already visible → swap to the new family now
    },
    destroy() {
      io.disconnect();
    }
  };
}
