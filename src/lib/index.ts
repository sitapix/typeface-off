import Logo from './Logo.svelte';
import Icon from './Icon.svelte';
import ThemeSwitch from './ThemeSwitch.svelte';
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
import fonts from './fonts';

import { createGame, createConfetti } from './game';

export {
  /* Components */
  Logo,
  Icon,
  ThemeSwitch,
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
  /* Fonts Metadata */
  fonts,
  /* Tournament Game Factory */
  createGame,
  createConfetti
};
