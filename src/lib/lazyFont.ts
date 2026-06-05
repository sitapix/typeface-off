import type { Attachment } from 'svelte/attachments';

/**
 * Attachment factory: lazily apply a font to an element only when it scrolls
 * into view, so a long list of specimens (Browse table, Game bracket) downloads
 * each font's woff2 only when it's actually visible — not all at once.
 *
 * Until the element intersects the viewport it inherits the surrounding font;
 * on intersection we set `font-family`, which is what triggers the browser to
 * fetch that font. `font-display: swap` then swaps it in. `rootMargin` starts
 * the fetch slightly before the element is on screen to avoid a visible flash.
 *
 * As an attachment, the `family` argument is read inside the closure, so passing
 * a new family re-runs the attachment automatically (no manual `update`). Falls
 * back to applying immediately where IntersectionObserver is unavailable (older
 * browsers; SSR is a no-op since attachments are client-only).
 *
 * Usage: `<span {@attach lazyFont(font.family)}>…</span>`
 */
export function lazyFont(family: string): Attachment<HTMLElement> {
  return (node) => {
    const apply = () => {
      node.style.fontFamily = `'${family}', sans-serif`;
    };

    if (typeof IntersectionObserver === 'undefined') {
      apply();
      return;
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

    return () => io.disconnect();
  };
}
