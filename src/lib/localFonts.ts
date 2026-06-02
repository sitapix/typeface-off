import type { Font } from './fonts';

// Self-hosted OSS fonts — for fonts that aren't on Bunny or Fontsource (e.g.
// Font Squirrel kits, GitHub releases, foundry downloads). This file is NOT
// touched by the font generator, so entries here survive regeneration.
//
// To add one:
//   1. Put the file(s) in  static/fonts/   (woff2 preferred; ttf/otf also work)
//   2. Add a Font entry below with  source: 'local'  and a `faces` list.
//   3. It loads automatically — the layout injects the @font-face — and joins
//      the Game / Browse / type filters like any other font.
//
// A local entry whose `family` matches a Bunny/Fontsource font overrides it
// (your self-hosted copy wins).
export const localFonts: Font[] = [
  // Demo: Space Grotesk isn't on Bunny, so it's self-hosted from the bundled
  // file. Copy this shape for your own downloads.
  {
    family: 'Space Grotesk',
    category: 'sans',
    source: 'local',
    variants: ['regular'],
    faces: [{ src: '/fonts/SpaceGrotesk.ttf', weight: '400', style: 'normal' }],
    siteUrl: 'https://github.com/floriankarsten/space-grotesk',
    downloadUrl: 'https://github.com/floriankarsten/space-grotesk'
  }
];
