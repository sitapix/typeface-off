/**
 * Snapshot an on-screen DOM element to a JPEG and download or share it. Wraps
 * @zumer/snapdom (dynamically imported so it stays off the initial bundle and
 * never runs during SSR/prerender — call only from a client event handler).
 * snapdom does DOM→canvas (embedding web fonts); the standard canvas API does
 * the JPEG encode so we don't depend on snapdom's encoder signatures.
 *
 * Glyph edges are smoothed by supersampling: we capture at SUPERSAMPLE× the
 * layout size, then downscale to the final square with high-quality smoothing
 * (elementToCanvas). White-on-pure-black text aliases hard at 1:1 and JPEG adds
 * ringing on top — rendering big and shrinking turns those jagged max-contrast
 * edges into clean anti-aliased ones before the encoder ever sees them. snapdom
 * paints an opaque background (below) so the JPEG has no transparency or
 * triangle artifacts.
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

/** Layout width (px) the card is captured at, so the export is device-
 *  independent AND matches what's on screen. Must equal the card's own max
 *  width (the wrapper's `max-w-[490px]` in +page.svelte) so the saved image has
 *  the same type-to-frame proportions, padding ratio and line wrapping as the
 *  live card — capturing wider would bake in extra margin and smaller-looking
 *  type. The live card shrinks below this on narrow phones; pinning it here
 *  keeps the export the consistent desktop layout. Square, so height is pinned
 *  to the same value. */
const CARD_EXPORT_WIDTH = 490;
/** snapdom render scale. We render large (supersample) and shrink to
 *  CARD_OUTPUT_WIDTH so glyph edges come out smooth, not aliased. */
const CARD_SUPERSAMPLE = 4;
/** Final saved square size (px). 1080 is the standard social square; the 4×
 *  capture (2304²) downsamples into it cleanly. */
const CARD_OUTPUT_WIDTH = 1080;

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
  // Force a square (1:1) export. The card is aspect-square on-screen too, but
  // pinning the height makes the saved image square even if content would
  // otherwise stretch the box; overflow-hidden on the card clips any spill.
  clone.style.height = `${CARD_EXPORT_WIDTH}px`;
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '-100000px';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);
  try {
    const result = await snapdom(clone, {
      scale: CARD_SUPERSAMPLE,
      dpr: 1, // pin to 1 so a retina vs non-retina device can't change the size
      embedFonts: true,
      backgroundColor
    });
    // Await the canvas before `finally` removes the clone — toCanvas() is async.
    const hi = await result.toCanvas(); // supersampled square (490 × 4 = 1960)
    // Downsample to the final square with high-quality smoothing. This is what
    // makes the text crisp: averaging 4× pixels turns hard-aliased white-on-
    // black edges into smooth ones (and pins the output size for every device).
    const out = document.createElement('canvas');
    out.width = CARD_OUTPUT_WIDTH;
    out.height = CARD_OUTPUT_WIDTH;
    const ctx = out.getContext('2d');
    if (!ctx) return hi; // no 2D context: fall back to the raw supersample
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(hi, 0, 0, CARD_OUTPUT_WIDTH, CARD_OUTPUT_WIDTH);
    return out;
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
