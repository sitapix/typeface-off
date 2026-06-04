import { persisted } from './persisted.svelte';

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
// Browse/detail type-tester text: type your own copy and compare it across
// fonts. Persisted, so it survives reloads and font switches. The Game ignores
// it (its duel specimens stay fixed for a fair comparison).
export const previewText = persisted<string>('previewText', '');
export const menuOpen = persisted<boolean>('menuOpen', false);
// Desktop (lg+) sidebar rail width in px, user-draggable via ResizeHandle.
// Clamped where it's consumed (AppFrame), not here, since the max depends on the
// viewport. 352 = the previous fixed `lg:w-[22rem]`.
export const sidebarWidth = persisted<number>('sidebarWidth', 352);
export const showName = persisted<boolean>('showName', false);
export const ligatures = persisted<boolean>('ligatures', true);
// Mobile: collapse the app header + controls to give the duel more room.
export const topCollapsed = persisted<boolean>('topCollapsed', false);
// Active color scheme (Skeleton theme name). Applied to <html data-theme> by
// ThemePicker; must be one of the themes imported in app.css.
export const theme = persisted<string>('theme', 'cerberus');
// Active specimen colour scheme for non-mono previews (Game + Browse + detail).
// Stored as an index into SPECIMEN_SCHEMES; mono specimens (CodePreview) ignore
// it. Theme-independent — see specimenSchemes.ts.
export const specimenScheme = persisted<number>('specimenScheme', 0);
