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

// Curated set of popular open-source Google Fonts (auto-generated from Google
// Fonts metadata, sorted by popularity). Webfonts are loaded via the @import in
// src/app.css — keep that list in sync with these families.
const seeds: FontSeed[] = [
  { family: "Roboto", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Open Sans", category: 'sans', variants: ["300","regular","500","600","700","800","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Inter", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Montserrat", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Poppins", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Lato", category: 'sans', variants: ["100","300","regular","700","900","100italic","300italic","italic","700italic","900italic"] },
  { family: "Arimo", category: 'sans', variants: ["regular","500","600","700","italic","500italic","600italic","700italic"] },
  { family: "Roboto Condensed", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Noto Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Oswald", category: 'sans', variants: ["200","300","regular","500","600","700"] },
  { family: "Raleway", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Nunito", category: 'sans', variants: ["200","300","regular","500","600","700","800","900","1000","1000italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Nunito Sans", category: 'sans', variants: ["200","300","regular","500","600","700","800","900","1000","1000italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "DM Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","1000","1000italic","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Rubik", category: 'sans', variants: ["300","regular","500","600","700","800","900","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Archivo Black", category: 'sans', variants: ["regular"] },
  { family: "Ubuntu", category: 'sans', variants: ["300","regular","500","700","300italic","italic","500italic","700italic"] },
  { family: "Kanit", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Work Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Outfit", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Manrope", category: 'sans', variants: ["200","300","regular","500","600","700","800"] },
  { family: "PT Sans", category: 'sans', variants: ["regular","700","italic","700italic"] },
  { family: "Bebas Neue", category: 'sans', variants: ["regular"] },
  { family: "Prompt", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Mulish", category: 'sans', variants: ["200","300","regular","500","600","700","800","900","1000","1000italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Quicksand", category: 'sans', variants: ["300","regular","500","600","700"] },
  { family: "Saira", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Figtree", category: 'sans', variants: ["300","regular","500","600","700","800","900","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Source Sans 3", category: 'sans', variants: ["200","300","regular","500","600","700","800","900","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Barlow", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "IBM Plex Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","100italic","200italic","300italic","italic","500italic","600italic","700italic"] },
  { family: "Bricolage Grotesque", category: 'sans', variants: ["200","300","regular","500","600","700","800"] },
  { family: "Smooch Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Share Tech", category: 'sans', variants: ["regular"] },
  { family: "Plus Jakarta Sans", category: 'sans', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Fira Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Karla", category: 'sans', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Archivo", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Jost", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Titillium Web", category: 'sans', variants: ["200","300","regular","600","700","900","200italic","300italic","italic","600italic","700italic"] },
  { family: "Heebo", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Fjalla One", category: 'sans', variants: ["regular"] },
  { family: "Libre Franklin", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Public Sans", category: 'sans', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Playfair Display", category: 'serif', variants: ["regular","500","600","700","800","900","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Roboto Slab", category: 'serif', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Merriweather", category: 'serif', variants: ["300","regular","500","600","700","800","900","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Lora", category: 'serif', variants: ["regular","500","600","700","italic","500italic","600italic","700italic"] },
  { family: "Noto Serif", category: 'serif', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "PT Serif", category: 'serif', variants: ["regular","700","italic","700italic"] },
  { family: "Libre Baskerville", category: 'serif', variants: ["regular","500","600","700","italic","500italic","600italic","700italic"] },
  { family: "Instrument Serif", category: 'serif', variants: ["regular","italic"] },
  { family: "Cormorant Garamond", category: 'serif', variants: ["300","regular","500","600","700","300italic","italic","500italic","600italic","700italic"] },
  { family: "EB Garamond", category: 'serif', variants: ["regular","500","600","700","800","italic","500italic","600italic","700italic","800italic"] },
  { family: "Bitter", category: 'serif', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "DM Serif Display", category: 'serif', variants: ["regular","italic"] },
  { family: "Crimson Text", category: 'serif', variants: ["regular","600","700","italic","600italic","700italic"] },
  { family: "Slabo 27px", category: 'serif', variants: ["regular"] },
  { family: "Source Serif 4", category: 'serif', variants: ["200","300","regular","500","600","700","800","900","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Arvo", category: 'serif', variants: ["regular","700","italic","700italic"] },
  { family: "Cinzel", category: 'serif', variants: ["regular","500","600","700","800","900"] },
  { family: "Fraunces", category: 'serif', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Domine", category: 'serif', variants: ["regular","500","600","700"] },
  { family: "Bodoni Moda", category: 'serif', variants: ["regular","500","600","700","800","900","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Nanum Myeongjo", category: 'serif', variants: ["regular","700","800"] },
  { family: "IBM Plex Serif", category: 'serif', variants: ["100","200","300","regular","500","600","700","100italic","200italic","300italic","italic","500italic","600italic","700italic"] },
  { family: "Marcellus", category: 'serif', variants: ["regular"] },
  { family: "Zilla Slab", category: 'serif', variants: ["300","regular","500","600","700","300italic","italic","500italic","600italic","700italic"] },
  { family: "Cormorant", category: 'serif', variants: ["300","regular","500","600","700","300italic","italic","500italic","600italic","700italic"] },
  { family: "Newsreader", category: 'serif', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Spectral", category: 'serif', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Roboto Serif", category: 'serif', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Frank Ruhl Libre", category: 'serif', variants: ["300","regular","500","600","700","800","900"] },
  { family: "Vollkorn", category: 'serif', variants: ["regular","500","600","700","800","900","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "DM Serif Text", category: 'serif', variants: ["regular","italic"] },
  { family: "Amiri", category: 'serif', variants: ["regular","700","italic","700italic"] },
  { family: "Dancing Script", category: 'display', variants: ["regular","500","600","700"] },
  { family: "Changa One", category: 'display', variants: ["regular","italic"] },
  { family: "Lobster Two", category: 'display', variants: ["regular","700","italic","700italic"] },
  { family: "Alfa Slab One", category: 'display', variants: ["regular"] },
  { family: "Caveat", category: 'display', variants: ["regular","500","600","700"] },
  { family: "Lilita One", category: 'display', variants: ["regular"] },
  { family: "Bungee", category: 'display', variants: ["regular"] },
  { family: "Pacifico", category: 'display', variants: ["regular"] },
  { family: "Lobster", category: 'display', variants: ["regular"] },
  { family: "Comfortaa", category: 'display', variants: ["300","regular","500","600","700"] },
  { family: "Shadows Into Light", category: 'display', variants: ["regular"] },
  { family: "Black Ops One", category: 'display', variants: ["regular"] },
  { family: "Abril Fatface", category: 'display', variants: ["regular"] },
  { family: "Kalam", category: 'display', variants: ["300","regular","700"] },
  { family: "Satisfy", category: 'display', variants: ["regular"] },
  { family: "Great Vibes", category: 'display', variants: ["regular"] },
  { family: "Permanent Marker", category: 'display', variants: ["regular"] },
  { family: "Indie Flower", category: 'display', variants: ["regular"] },
  { family: "Angkor", category: 'display', variants: ["regular"] },
  { family: "Gravitas One", category: 'display', variants: ["regular"] },
  { family: "Titan One", category: 'display', variants: ["regular"] },
  { family: "Press Start 2P", category: 'display', variants: ["regular"] },
  { family: "Luckiest Guy", category: 'display', variants: ["regular"] },
  { family: "Rowdies", category: 'display', variants: ["300","regular","700"] },
  { family: "Goldman", category: 'display', variants: ["regular","700"] },
  { family: "Righteous", category: 'display', variants: ["regular"] },
  { family: "Creepster", category: 'display', variants: ["regular"] },
  { family: "Oleo Script", category: 'display', variants: ["regular","700"] },
  { family: "Yellowtail", category: 'display', variants: ["regular"] },
  { family: "Comic Neue", category: 'display', variants: ["300","regular","700","300italic","italic","700italic"] },
  { family: "Fugaz One", category: 'display', variants: ["regular"] },
  { family: "Allura", category: 'display', variants: ["regular"] }
];

const fonts: Font[] = seeds.map((seed) => ({
  ...seed,
  siteUrl: specimenUrl(seed.family),
  downloadUrl: downloadUrl(seed.family)
}));

export default fonts;
