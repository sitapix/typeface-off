export type FontCategory = 'sans' | 'serif' | 'display';

export interface Font {
  family: string;
  category: FontCategory;
  variants: string[];
  siteUrl: string;
  downloadUrl: string;
}

function specimenUrl(family: string): string {
  return `https://fonts.google.com/specimen/${family.replace(/\s+/g, '+')}`;
}

function downloadUrl(family: string): string {
  return `https://fonts.google.com/download?family=${encodeURIComponent(family)}`;
}

interface FontSeed {
  family: string;
  category: FontCategory;
  variants: string[];
}

const seeds: FontSeed[] = [
  // Sans-serif
  { family: 'Inter', category: 'sans', variants: ['regular', '500', '700', 'italic'] },
  { family: 'Roboto', category: 'sans', variants: ['regular', '500', '700', 'italic'] },
  { family: 'Open Sans', category: 'sans', variants: ['regular', '600', '700', 'italic'] },
  { family: 'Lato', category: 'sans', variants: ['regular', '700', 'italic'] },
  { family: 'Montserrat', category: 'sans', variants: ['regular', '600', '700', 'italic'] },
  { family: 'Poppins', category: 'sans', variants: ['regular', '500', '700', 'italic'] },
  { family: 'Work Sans', category: 'sans', variants: ['regular', '500', '700', 'italic'] },
  { family: 'Nunito', category: 'sans', variants: ['regular', '600', '700', 'italic'] },
  { family: 'Raleway', category: 'sans', variants: ['regular', '600', '700', 'italic'] },
  { family: 'DM Sans', category: 'sans', variants: ['regular', '500', '700', 'italic'] },
  { family: 'Manrope', category: 'sans', variants: ['regular', '500', '700'] },
  // Serif
  { family: 'Merriweather', category: 'serif', variants: ['regular', '700', 'italic'] },
  { family: 'Playfair Display', category: 'serif', variants: ['regular', '700', 'italic'] },
  { family: 'Lora', category: 'serif', variants: ['regular', '600', '700', 'italic'] },
  { family: 'PT Serif', category: 'serif', variants: ['regular', '700', 'italic'] },
  { family: 'EB Garamond', category: 'serif', variants: ['regular', '600', 'italic'] },
  { family: 'Bitter', category: 'serif', variants: ['regular', '600', '700', 'italic'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['regular', '700', 'italic'] },
  { family: 'Source Serif 4', category: 'serif', variants: ['regular', '600', '700', 'italic'] },
  // Display / script
  { family: 'Oswald', category: 'display', variants: ['300', 'regular', '500', '700'] },
  { family: 'Bebas Neue', category: 'display', variants: ['regular'] },
  { family: 'Lobster', category: 'display', variants: ['regular'] },
  { family: 'Pacifico', category: 'display', variants: ['regular'] },
  { family: 'Caveat', category: 'display', variants: ['regular', '500', '700'] },
  { family: 'Dancing Script', category: 'display', variants: ['regular', '500', '700'] },
  { family: 'Abril Fatface', category: 'display', variants: ['regular'] },
  { family: 'Comfortaa', category: 'display', variants: ['300', 'regular', '700'] }
];

const fonts: Font[] = seeds.map((seed) => ({
  ...seed,
  siteUrl: specimenUrl(seed.family),
  downloadUrl: downloadUrl(seed.family)
}));

export default fonts;
