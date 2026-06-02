import { fonts } from '$lib';

export async function load({ params }) {
  const slug = params.slug;
  const decodedSlug = decodeURIComponent(slug);

  const font = fonts.find(
    (font) => font.family.replace(/\s+/g, '') === decodedSlug
  );
  if (font) {
    return { font };
  }
}
