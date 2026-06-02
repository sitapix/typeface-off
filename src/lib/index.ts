/* Components */
export { default as Logo } from './Logo.svelte';
export { default as Icon } from './Icon.svelte';
export { default as ThemeSwitch } from './ThemeSwitch.svelte';
export { default as ThemePicker } from './ThemePicker.svelte';
export { default as Controls } from './Controls.svelte';
export { default as SearchBar } from './SearchBar.svelte';
export { default as FontHeader } from './FontHeader.svelte';
export { default as FontTable } from './FontTable.svelte';
export { default as FontLinks } from './FontLinks.svelte';
export { default as CategoryFilter } from './CategoryFilter.svelte';
export { default as Sidebar } from './Sidebar.svelte';
export { default as Header } from './Header.svelte';
export { default as AppFrame } from './AppFrame.svelte';
export { default as PlayerBadge } from './PlayerBadge.svelte';
export { default as WinnerBadge } from './WinnerBadge.svelte';
export { default as NotePreview } from './NotePreview.svelte';
export { default as CodePreview } from './CodePreview.svelte';
export { default as FontPreview } from './FontPreview.svelte';
export { default as FontColumn } from './FontColumn.svelte';
export { default as FontDuel } from './FontDuel.svelte';
export { default as ResultsCard } from './ResultsCard.svelte';

/* Fonts catalog + lookup */
export { fonts, getFontByFamily } from './fontCatalog';

/* Tournament game factory + ranking */
export { createGame, createConfetti, placeFonts } from './game';
