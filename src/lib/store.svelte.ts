import { persisted } from './persisted.svelte';

export const fontSize = persisted<number>('fontSize', 20);
export const fontFamily = persisted<string>('fontFamily', 'Inter');
export const fontFamilyRight = persisted<string>('fontFamilyRight', '');
export const searchTerm = persisted<string>('searchTerm', '');
export const menuOpen = persisted<boolean>('menuOpen', false);
export const showName = persisted<boolean>('showName', false);
