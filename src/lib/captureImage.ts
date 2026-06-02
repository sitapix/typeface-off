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

async function elementToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  const { snapdom } = await import('@zumer/snapdom');
  const bg = getComputedStyle(el).backgroundColor;
  const backgroundColor = bg && !bg.includes('rgba(0, 0, 0, 0)') ? bg : '#ffffff';
  const result = await snapdom(el, { scale: 2, embedFonts: true, backgroundColor });
  return result.toCanvas();
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/jpeg',
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))),
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
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function')
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
