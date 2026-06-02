import { fonts } from '$lib';
import { matchesSlug } from '$lib/slug';

export async function load({ params }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const font = fonts.find((font) => matchesSlug(font.family, decodedSlug));
  if (font) {
    return { font };
  }
}
