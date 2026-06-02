export type FontCategory = 'sans' | 'serif' | 'display';
export type FontSource = 'google' | 'fontsource';

export interface Font {
  family: string;
  category: FontCategory;
  source: FontSource;
  /** Fontsource slug — present when source === 'fontsource'. */
  id?: string;
  variants: string[];
  siteUrl: string;
  downloadUrl: string;
}

interface FontSeed {
  family: string;
  category: FontCategory;
  source: FontSource;
  id?: string;
  variants: string[];
}

// Auto-generated: popular Google Fonts + Fontsource's non-Google OSS fonts.
// Webfonts load dynamically per source from src/routes/+layout.svelte, so this
// file is the single source of truth — add an entry and it loads automatically.
const seeds: FontSeed[] = [
  { family: "Roboto", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Open Sans", category: 'sans', source: 'google', variants: ["300","regular","500","600","700","800","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Inter", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Montserrat", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Poppins", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Lato", category: 'sans', source: 'google', variants: ["100","300","regular","700","900","100italic","300italic","italic","700italic","900italic"] },
  { family: "Arimo", category: 'sans', source: 'google', variants: ["regular","500","600","700","italic","500italic","600italic","700italic"] },
  { family: "Roboto Condensed", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Noto Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Oswald", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700"] },
  { family: "Raleway", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Nunito", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800","900","1000","1000italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Nunito Sans", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800","900","1000","1000italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "DM Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","1000","1000italic","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Rubik", category: 'sans', source: 'google', variants: ["300","regular","500","600","700","800","900","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Archivo Black", category: 'sans', source: 'google', variants: ["regular"] },
  { family: "Ubuntu", category: 'sans', source: 'google', variants: ["300","regular","500","700","300italic","italic","500italic","700italic"] },
  { family: "Kanit", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Work Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Outfit", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Manrope", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800"] },
  { family: "PT Sans", category: 'sans', source: 'google', variants: ["regular","700","italic","700italic"] },
  { family: "Bebas Neue", category: 'sans', source: 'google', variants: ["regular"] },
  { family: "Prompt", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Mulish", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800","900","1000","1000italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Quicksand", category: 'sans', source: 'google', variants: ["300","regular","500","600","700"] },
  { family: "Saira", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Figtree", category: 'sans', source: 'google', variants: ["300","regular","500","600","700","800","900","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Source Sans 3", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800","900","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Barlow", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "IBM Plex Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","100italic","200italic","300italic","italic","500italic","600italic","700italic"] },
  { family: "Bricolage Grotesque", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800"] },
  { family: "Smooch Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Share Tech", category: 'sans', source: 'google', variants: ["regular"] },
  { family: "Plus Jakarta Sans", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Fira Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Karla", category: 'sans', source: 'google', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Archivo", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Jost", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Titillium Web", category: 'sans', source: 'google', variants: ["200","300","regular","600","700","900","200italic","300italic","italic","600italic","700italic"] },
  { family: "Heebo", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Fjalla One", category: 'sans', source: 'google', variants: ["regular"] },
  { family: "Libre Franklin", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Public Sans", category: 'sans', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Playfair Display", category: 'serif', source: 'google', variants: ["regular","500","600","700","800","900","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Roboto Slab", category: 'serif', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Merriweather", category: 'serif', source: 'google', variants: ["300","regular","500","600","700","800","900","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Lora", category: 'serif', source: 'google', variants: ["regular","500","600","700","italic","500italic","600italic","700italic"] },
  { family: "Noto Serif", category: 'serif', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "PT Serif", category: 'serif', source: 'google', variants: ["regular","700","italic","700italic"] },
  { family: "Libre Baskerville", category: 'serif', source: 'google', variants: ["regular","500","600","700","italic","500italic","600italic","700italic"] },
  { family: "Instrument Serif", category: 'serif', source: 'google', variants: ["regular","italic"] },
  { family: "Cormorant Garamond", category: 'serif', source: 'google', variants: ["300","regular","500","600","700","300italic","italic","500italic","600italic","700italic"] },
  { family: "EB Garamond", category: 'serif', source: 'google', variants: ["regular","500","600","700","800","italic","500italic","600italic","700italic","800italic"] },
  { family: "Bitter", category: 'serif', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "DM Serif Display", category: 'serif', source: 'google', variants: ["regular","italic"] },
  { family: "Crimson Text", category: 'serif', source: 'google', variants: ["regular","600","700","italic","600italic","700italic"] },
  { family: "Slabo 27px", category: 'serif', source: 'google', variants: ["regular"] },
  { family: "Source Serif 4", category: 'serif', source: 'google', variants: ["200","300","regular","500","600","700","800","900","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Arvo", category: 'serif', source: 'google', variants: ["regular","700","italic","700italic"] },
  { family: "Cinzel", category: 'serif', source: 'google', variants: ["regular","500","600","700","800","900"] },
  { family: "Fraunces", category: 'serif', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Domine", category: 'serif', source: 'google', variants: ["regular","500","600","700"] },
  { family: "Bodoni Moda", category: 'serif', source: 'google', variants: ["regular","500","600","700","800","900","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Nanum Myeongjo", category: 'serif', source: 'google', variants: ["regular","700","800"] },
  { family: "IBM Plex Serif", category: 'serif', source: 'google', variants: ["100","200","300","regular","500","600","700","100italic","200italic","300italic","italic","500italic","600italic","700italic"] },
  { family: "Marcellus", category: 'serif', source: 'google', variants: ["regular"] },
  { family: "Zilla Slab", category: 'serif', source: 'google', variants: ["300","regular","500","600","700","300italic","italic","500italic","600italic","700italic"] },
  { family: "Cormorant", category: 'serif', source: 'google', variants: ["300","regular","500","600","700","300italic","italic","500italic","600italic","700italic"] },
  { family: "Newsreader", category: 'serif', source: 'google', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Spectral", category: 'serif', source: 'google', variants: ["200","300","regular","500","600","700","800","200italic","300italic","italic","500italic","600italic","700italic","800italic"] },
  { family: "Roboto Serif", category: 'serif', source: 'google', variants: ["100","200","300","regular","500","600","700","800","900","100italic","200italic","300italic","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "Frank Ruhl Libre", category: 'serif', source: 'google', variants: ["300","regular","500","600","700","800","900"] },
  { family: "Vollkorn", category: 'serif', source: 'google', variants: ["regular","500","600","700","800","900","italic","500italic","600italic","700italic","800italic","900italic"] },
  { family: "DM Serif Text", category: 'serif', source: 'google', variants: ["regular","italic"] },
  { family: "Amiri", category: 'serif', source: 'google', variants: ["regular","700","italic","700italic"] },
  { family: "Dancing Script", category: 'display', source: 'google', variants: ["regular","500","600","700"] },
  { family: "Changa One", category: 'display', source: 'google', variants: ["regular","italic"] },
  { family: "Lobster Two", category: 'display', source: 'google', variants: ["regular","700","italic","700italic"] },
  { family: "Alfa Slab One", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Caveat", category: 'display', source: 'google', variants: ["regular","500","600","700"] },
  { family: "Lilita One", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Bungee", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Pacifico", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Lobster", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Comfortaa", category: 'display', source: 'google', variants: ["300","regular","500","600","700"] },
  { family: "Shadows Into Light", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Black Ops One", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Abril Fatface", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Kalam", category: 'display', source: 'google', variants: ["300","regular","700"] },
  { family: "Satisfy", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Great Vibes", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Permanent Marker", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Indie Flower", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Angkor", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Gravitas One", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Titan One", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Press Start 2P", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Luckiest Guy", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Rowdies", category: 'display', source: 'google', variants: ["300","regular","700"] },
  { family: "Goldman", category: 'display', source: 'google', variants: ["regular","700"] },
  { family: "Righteous", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Creepster", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Oleo Script", category: 'display', source: 'google', variants: ["regular","700"] },
  { family: "Yellowtail", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Comic Neue", category: 'display', source: 'google', variants: ["300","regular","700","300italic","italic","700italic"] },
  { family: "Fugaz One", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Allura", category: 'display', source: 'google', variants: ["regular"] },
  { family: "Adwaita Sans", category: 'sans', source: 'fontsource', id: "adwaita-sans", variants: ["100","200","300","regular","500","600","700","800","900","italic"] },
  { family: "Aileron", category: 'sans', source: 'fontsource', id: "aileron", variants: ["100","300","regular","600","700","800","italic"] },
  { family: "Apfel Grotezk", category: 'sans', source: 'fontsource', id: "apfel-grotezk", variants: ["regular","700"] },
  { family: "Argentum Sans", category: 'sans', source: 'fontsource', id: "argentum-sans", variants: ["100","200","300","regular","500","600","700","800","900","italic"] },
  { family: "Bagnard", category: 'serif', source: 'fontsource', id: "bagnard", variants: ["regular"] },
  { family: "Bagnard Sans", category: 'sans', source: 'fontsource', id: "bagnard-sans", variants: ["regular"] },
  { family: "Blackout Midnight", category: 'display', source: 'fontsource', id: "blackout-midnight", variants: ["regular"] },
  { family: "Blackout Sunrise", category: 'display', source: 'fontsource', id: "blackout-sunrise", variants: ["regular"] },
  { family: "Blackout Two AM", category: 'display', source: 'fontsource', id: "blackout-two-am", variants: ["regular"] },
  { family: "Bluu Next", category: 'sans', source: 'fontsource', id: "bluu-next", variants: ["700","italic"] },
  { family: "Bravura", category: 'sans', source: 'fontsource', id: "bravura", variants: ["regular"] },
  { family: "Bravura Text", category: 'sans', source: 'fontsource', id: "bravura-text", variants: ["regular"] },
  { family: "Chunk Five", category: 'serif', source: 'fontsource', id: "chunk-five", variants: ["800"] },
  { family: "Clear Sans", category: 'sans', source: 'fontsource', id: "clear-sans", variants: ["100","300","regular","500","700","italic"] },
  { family: "Cooper Hewitt", category: 'sans', source: 'fontsource', id: "cooper-hewitt", variants: ["100","200","300","regular","500","600","700","800","italic"] },
  { family: "DejaVu Math", category: 'display', source: 'fontsource', id: "dejavu-math", variants: ["regular"] },
  { family: "DejaVu Sans", category: 'sans', source: 'fontsource', id: "dejavu-sans", variants: ["regular","700","italic"] },
  { family: "DejaVu Serif", category: 'serif', source: 'fontsource', id: "dejavu-serif", variants: ["regular","700","italic"] },
  { family: "FiraGO", category: 'sans', source: 'fontsource', id: "firago", variants: ["100","200","300","regular","500","600","700","800","900","italic"] },
  { family: "Fusion Kai G", category: 'display', source: 'fontsource', id: "fusion-kai-g", variants: ["regular"] },
  { family: "Fusion Kai J", category: 'display', source: 'fontsource', id: "fusion-kai-j", variants: ["regular"] },
  { family: "Fusion Kai T", category: 'display', source: 'fontsource', id: "fusion-kai-t", variants: ["regular"] },
  { family: "Geist Sans", category: 'sans', source: 'fontsource', id: "geist-sans", variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Genjyuu Gothic", category: 'sans', source: 'fontsource', id: "genjyuu-gothic", variants: ["100","200","300","regular","500","700","900"] },
  { family: "Hauora Sans", category: 'sans', source: 'fontsource', id: "hauora-sans", variants: ["200","300","regular","500","600","700","800"] },
  { family: "iA Writer Quattro", category: 'sans', source: 'fontsource', id: "ia-writer-quattro", variants: ["regular","700","italic"] },
  { family: "Junction", category: 'sans', source: 'fontsource', id: "junction", variants: ["300","regular","700"] },
  { family: "Karmilla", category: 'sans', source: 'fontsource', id: "karmilla", variants: ["regular","700"] },
  { family: "Lextrall", category: 'sans', source: 'fontsource', id: "lextrall", variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Libre Caslon Condensed", category: 'serif', source: 'fontsource', id: "libre-caslon-condensed", variants: ["regular","500","600","700","italic"] },
  { family: "LXGW WenKai", category: 'sans', source: 'fontsource', id: "lxgw-wenkai", variants: ["300","500","700"] },
  { family: "Metropolis", category: 'sans', source: 'fontsource', id: "metropolis", variants: ["100","200","300","regular","500","600","700","800","900","italic"] },
  { family: "Monaspace Radon", category: 'display', source: 'fontsource', id: "monaspace-radon", variants: ["200","300","regular","500","600","700","800","italic"] },
  { family: "Monaspace Xenon", category: 'serif', source: 'fontsource', id: "monaspace-xenon", variants: ["200","300","regular","500","600","700","800","italic"] },
  { family: "Nebula Sans", category: 'sans', source: 'fontsource', id: "nebula-sans", variants: ["300","regular","500","600","700","900","italic"] },
  { family: "Norwester", category: 'sans', source: 'fontsource', id: "norwester", variants: ["regular"] },
  { family: "Open Runde", category: 'sans', source: 'fontsource', id: "open-runde", variants: ["regular","500","600","700"] },
  { family: "Open Sauce One", category: 'sans', source: 'fontsource', id: "open-sauce-one", variants: ["300","regular","500","600","700","800","900","italic"] },
  { family: "Open Sauce Sans", category: 'sans', source: 'fontsource', id: "open-sauce-sans", variants: ["300","regular","500","600","700","800","900","italic"] },
  { family: "Open Sauce Two", category: 'sans', source: 'fontsource', id: "open-sauce-two", variants: ["300","regular","500","600","700","800","900","italic"] },
  { family: "OpenDyslexic", category: 'sans', source: 'fontsource', id: "opendyslexic", variants: ["regular","700","italic"] },
  { family: "Ostrich Sans", category: 'sans', source: 'fontsource', id: "ostrich-sans", variants: ["300","regular","700","900"] },
  { family: "Peace Sans", category: 'sans', source: 'fontsource', id: "peace-sans", variants: ["regular"] },
  { family: "Pitagon Sans", category: 'sans', source: 'fontsource', id: "pitagon-sans", variants: ["regular","500","600","700","800","900"] },
  { family: "Pitagon Sans Text", category: 'sans', source: 'fontsource', id: "pitagon-sans-text", variants: ["200","300","regular","500","600","700","800","italic"] },
  { family: "Pitagon Serif", category: 'serif', source: 'fontsource', id: "pitagon-serif", variants: ["100","200","300","regular","500","600","700","800","900","italic"] },
  { family: "Pretendard", category: 'sans', source: 'fontsource', id: "pretendard", variants: ["100","200","300","regular","500","600","700","800","900"] },
  { family: "Redaction", category: 'serif', source: 'fontsource', id: "redaction", variants: ["regular","700","italic"] },
  { family: "Redaction 10", category: 'serif', source: 'fontsource', id: "redaction-10", variants: ["regular","700","italic"] },
  { family: "Redaction 100", category: 'serif', source: 'fontsource', id: "redaction-100", variants: ["regular","700","italic"] },
  { family: "Redaction 20", category: 'serif', source: 'fontsource', id: "redaction-20", variants: ["regular","700","italic"] },
  { family: "Redaction 35", category: 'serif', source: 'fontsource', id: "redaction-35", variants: ["regular","700","italic"] },
  { family: "Redaction 50", category: 'serif', source: 'fontsource', id: "redaction-50", variants: ["regular","700","italic"] },
  { family: "Redaction 70", category: 'serif', source: 'fontsource', id: "redaction-70", variants: ["regular","700","italic"] },
  { family: "Rubik One", category: 'sans', source: 'fontsource', id: "rubik-one", variants: ["regular"] },
  { family: "Syne Italic", category: 'sans', source: 'fontsource', id: "syne-italic", variants: ["regular","italic"] },
  { family: "Uncut Sans", category: 'sans', source: 'fontsource', id: "uncut-sans", variants: ["300","regular","500","600","700","italic"] },
  { family: "Unifont", category: 'sans', source: 'fontsource', id: "unifont", variants: ["regular"] },
  { family: "WIN95FA", category: 'sans', source: 'fontsource', id: "win95fa", variants: ["regular"] }
];

function siteUrl(s: FontSeed): string {
  return s.source === 'google'
    ? `https://fonts.google.com/specimen/${s.family.replace(/\s+/g, '+')}`
    : `https://fontsource.org/fonts/${s.id}`;
}

function downloadUrl(s: FontSeed): string {
  return s.source === 'google'
    ? `https://fonts.google.com/download?family=${encodeURIComponent(s.family)}`
    : `https://fontsource.org/fonts/${s.id}`;
}

const fonts: Font[] = seeds.map((seed) => ({
  ...seed,
  siteUrl: siteUrl(seed),
  downloadUrl: downloadUrl(seed)
}));

export default fonts;
