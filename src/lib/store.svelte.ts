import { persisted } from './persisted.svelte';
import { DEFAULT_CODE } from './codeSample';
import { DEFAULT_CODE_THEME } from './codeThemes';

// Specimen size. Default smaller on phones/tablets (the stacked tap-duel has
// less room than the desktop two-column view); only the initial value, the
// user's own adjustment persists from there. `lg` (1024px) is where the layout
// switches. SSR/prerender has no window, so it falls back to the desktop size.
// First-run default: large enough to read the letterforms and fill the specimen
// without overflowing. Mobile is a touch smaller than desktop since each duel
// half is shorter.
const defaultFontSize =
  typeof window !== 'undefined' && window.innerWidth < 1024 ? 18 : 22;
export const fontSize = persisted<number>('fontSize', defaultFontSize);
export const fontFamily = persisted<string>('fontFamily', 'Inter');
export const fontFamilyRight = persisted<string>('fontFamilyRight', '');
export const searchTerm = persisted<string>('searchTerm', '');
// Default type-tester copy — rich HTML (the format the SampleComposer's Tiptap
// editor reads/writes), exercising a heading, body, bold, italic, figures and
// punctuation so even the untouched default shows the font working across styles.
// Tiptap-shaped tags (<h1>/<p>/<strong>/<em>) so the editor round-trips it cleanly.
export const DEFAULT_TEXT =
  '<h1>Sphinx of black quartz</h1><p>Judge my vow — the <strong>quick brown fox</strong> jumps over the <em>lazy dog</em>.</p><p>Typography &amp; legibility: “quotes,” (parens), $1,234.56, 50% — 0123456789.</p>';
// Shared type-tester copy (rich HTML) for the text specimens — the same content
// across every font and both Game-duel panels. Persisted. Edited live in the one
// SampleComposer (Tiptap); every specimen renders it read-only via {@html}, so it
// carries into play. The curated specimen shows only while this is still the
// untouched DEFAULT_TEXT (or blank).
export const previewText = persisted<string>('previewText', DEFAULT_TEXT);
// True when the player has written their own copy (diverged from the default and
// not blank). Drives specimens: custom copy → render it; otherwise → curated.
export function isCustomPreview(html: string): boolean {
  return html !== DEFAULT_TEXT && html.replace(/<[^>]+>/g, '').trim() !== '';
}
// Mono specimen editor (CodePreview) text: type your own code and compare it
// across coding fonts. Persisted, so it survives reloads and font switches. One
// shared buffer, so both Game-duel panels show the same code (only the typeface
// differs) and edits anywhere stay in sync. Defaults to DEFAULT_CODE.
export const codeSample = persisted<string>('codeSample', DEFAULT_CODE);
// Global edit mode. Off (default) = specimens are display-only and the duel is
// tap-to-pick; on = specimens become typeable type-testers (code via codeSample,
// text via previewText). A setup mode: type your sample once (it persists), turn
// edit off, then play with your own copy showing across every font.
export const editMode = persisted<boolean>('editMode', false);
// Shiki theme for the code editor (CodePreview); one of CODE_THEMES (codeThemes.ts).
// The editor surface is derived from the theme's colours, so this re-skins the
// whole editor. Persisted. Mono-only; text specimens use specimenScheme.
export const codeTheme = persisted<string>('codeTheme', DEFAULT_CODE_THEME);
export const menuOpen = persisted<boolean>('menuOpen', false);
// Desktop (lg+) sidebar rail width in px, user-draggable via ResizeHandle.
// Clamped where it's consumed (AppFrame), not here, since the max depends on the
// viewport. 352 = the previous fixed `lg:w-[22rem]`.
export const sidebarWidth = persisted<number>('sidebarWidth', 352);
export const showName = persisted<boolean>('showName', false);
export const ligatures = persisted<boolean>('ligatures', true);
// Mobile: collapse the app header + controls to give the duel more room.
// Defaults collapsed so first contact on a phone is the duel itself (the fonts
// are the star) — the category/bracket filters reveal via the toolbar's Show
// toggle. Persisted, so a player who expands it keeps it expanded.
export const topCollapsed = persisted<boolean>('topCollapsed', true);
// First-run flag: flips true on the player's first pick. Gates the one-time
// "how to play" prompt by the duel so returning players never see it again.
export const hasPlayed = persisted<boolean>('hasPlayed', false);
// Active color scheme (Skeleton theme name). Applied to <html data-theme> by
// ThemePicker; must be one of the themes imported in app.css.
export const theme = persisted<string>('theme', 'cerberus');
// Light/dark mode. Shared (not local to ThemeSwitch) so every dark-mode control
// reads/writes the same value — the header switch and the mobile Settings sheet
// stay in sync. Applied to <html> (dark class + colorScheme) by ThemeSwitch.
export const colorScheme = persisted<'light' | 'dark'>('color-scheme', 'light');
// Active specimen colour scheme for non-mono previews (Game + Browse + detail).
// Stored as an index into SPECIMEN_SCHEMES; mono specimens (CodePreview) ignore
// it. Theme-independent — see specimenSchemes.ts.
export const specimenScheme = persisted<number>('specimenScheme', 0);
