/**
 * Snapshot an on-screen DOM element to a JPEG and download or share it. Wraps
 * @zumer/snapdom (dynamically imported so it stays off the initial bundle and
 * never runs during SSR/prerender — call only from a client event handler).
 * snapdom does DOM→canvas (embedding web fonts); the standard canvas API does
 * the JPEG encode so we don't depend on snapdom's encoder signatures.
 */

/** Pre-load every inline `font-family` in the subtree so the snapshot isn't a
 *  fallback-font render of a font that hasn't downloaded yet. */
async function ensureFontsLoaded(el: HTMLElement): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const families = new Set<string>();
  el.querySelectorAll<HTMLElement>('[style*="font-family"]').forEach((node) => {
    const family = node.style.fontFamily;
    if (family) families.add(family);
  });
  await Promise.all(
    [...families].map((f) => document.fonts.load(`24px ${f}`).catch(() => {}))
  );
  await document.fonts.ready;
}

/** Fixed capture width (px) for the share card, so the exported JPEG is the same
 *  size on every device. Matches the card's own max width (Tailwind `max-w-xl` =
 *  36rem); the live card shrinks below this on narrow phones, which would
 *  otherwise bake the phone's width — and its different line wrapping — into the
 *  saved image. Final pixels = this × CARD_EXPORT_SCALE (dpr is pinned below so
 *  the device's pixel ratio doesn't change the output size). */
const CARD_EXPORT_WIDTH = 576;
const CARD_EXPORT_SCALE = 2;

async function elementToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  const { snapdom } = await import('@zumer/snapdom');
  const bg = getComputedStyle(el).backgroundColor;
  const backgroundColor =
    bg && !bg.includes('rgba(0, 0, 0, 0)') ? bg : '#ffffff';
  // Snapshot an off-screen copy pinned to a fixed width so the result is
  // device-independent. The clone is self-contained (it carries its own grain
  // <filter> and inline font-families), and the fonts it needs were already
  // awaited by ensureFontsLoaded on the live element.
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.width = `${CARD_EXPORT_WIDTH}px`;
  clone.style.maxWidth = `${CARD_EXPORT_WIDTH}px`;
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '-100000px';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);
  try {
    const result = await snapdom(clone, {
      scale: CARD_EXPORT_SCALE,
      dpr: 1, // pin to 1 so a retina vs non-retina device can't change the size
      embedFonts: true,
      backgroundColor
    });
    // Await the canvas before `finally` removes the clone — toCanvas() is async.
    return await result.toCanvas();
  } finally {
    clone.remove();
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/jpeg',
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('canvas.toBlob failed')),
      type,
      quality
    )
  );
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}

/** True when the platform can share image files via the native share sheet. */
export function canShareFiles(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.canShare !== 'function'
  )
    return false;
  try {
    return navigator.canShare({
      files: [new File([], 'x.jpg', { type: 'image/jpeg' })]
    });
  } catch {
    return false;
  }
}

/** Capture `el` and save it as a JPEG download. */
export async function downloadElement(
  el: HTMLElement,
  filename: string
): Promise<void> {
  await ensureFontsLoaded(el);
  const canvas = await elementToCanvas(el);
  triggerDownload(canvas.toDataURL('image/jpeg', 0.95), filename);
}

/** Capture `el` and open the native share sheet (falls back to download). */
export async function shareElement(
  el: HTMLElement,
  filename: string,
  title = ''
): Promise<void> {
  await ensureFontsLoaded(el);
  const canvas = await elementToCanvas(el);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], filename, { type: 'image/jpeg' });
  if (canShareFiles()) {
    await navigator.share({ files: [file], title });
    return;
  }
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}
