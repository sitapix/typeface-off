import { persisted } from './persisted.svelte';

export const fontSize = persisted<number>('fontSize', 20);
export const fontFamily = persisted<string>('fontFamily', 'Inter');
export const fontFamilyRight = persisted<string>('fontFamilyRight', '');
export const searchTerm = persisted<string>('searchTerm', '');
// Browse/detail type-tester text: type your own copy and compare it across
// fonts. Persisted, so it survives reloads and font switches. The Game ignores
// it (its duel specimens stay fixed for a fair comparison).
export const previewText = persisted<string>('previewText', '');
export const menuOpen = persisted<boolean>('menuOpen', false);
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
