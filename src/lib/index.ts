import Logo from './Logo.svelte';
import Icon from './Icon.svelte';
import ThemeSwitch from './ThemeSwitch.svelte';
import ThemePicker from './ThemePicker.svelte';
import Controls from './Controls.svelte';
import SearchBar from './SearchBar.svelte';
import FontTable from './FontTable.svelte';
import FontHeader from './FontHeader.svelte';
import Sidebar from './Sidebar.svelte';
import Header from './Header.svelte';
import AppFrame from './AppFrame.svelte';
import PlayerBadge from './PlayerBadge.svelte';
import WinnerBadge from './WinnerBadge.svelte';
import NotePreview from './NotePreview.svelte';
import CodePreview from './CodePreview.svelte';
import FontPreview from './FontPreview.svelte';
import FontDuel from './FontDuel.svelte';
import generatedFonts from './fonts';
import { localFonts } from './localFonts';
import { localGeneratedFonts } from './localFonts.generated';
import { withBase } from './fontFaces';
import { base } from '$app/paths';

import { createGame, createConfetti } from './game';

// Merge self-hosted (local) fonts with the generated Bunny/Fontsource set.
// Local entries take precedence over a same-named generated font.
// Precedence: manual localFonts > YAML-generated local fonts > Bunny/Fontsource
// catalog. A self-hosted family overrides a same-named catalog font.
const localAll = [
  ...localFonts,
  ...localGeneratedFonts.filter(
    (g) => !localFonts.some((m) => m.family === g.family)
  )
];
const localFamilies = new Set(localAll.map((f) => f.family));
// Base-prefix self-hosted asset URLs (e.g. /fonts/x.ttf) so the Visit/Download
// links resolve on a GitHub Pages project site. Absolute http(s) URLs (Bunny /
// Fontsource) pass through `withBase` unchanged.
const fonts = [
  ...localAll,
  ...generatedFonts.filter((f) => !localFamilies.has(f.family))
].map((f) => ({
  ...f,
  siteUrl: withBase(f.siteUrl, base),
  downloadUrl: withBase(f.downloadUrl, base)
}));

export {
  /* Components */
  Logo,
  Icon,
  ThemeSwitch,
  ThemePicker,
  Controls,
  SearchBar,
  FontHeader,
  FontTable,
  Sidebar,
  Header,
  AppFrame,
  PlayerBadge,
  WinnerBadge,
  NotePreview,
  CodePreview,
  FontPreview,
  FontDuel,
  /* Fonts Metadata */
  fonts,
  /* Tournament Game Factory */
  createGame,
  createConfetti
};
