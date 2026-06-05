// Curated Shiki themes for the code editor (CodePreview) — parallel to
// specimenSchemes.ts (which colours the text specimens). A light+dark mix; the
// editor surface (background, gutter, chrome bar, borders) is driven entirely
// from each theme's own `bg`/`fg` (the rest is derived via color-mix in
// CodePreview), so picking a theme re-skins the whole editor, not just the syntax.
//
// `bg`/`fg` are the themes' real editor.background / editor.foreground, read from
// `@shikijs/themes`. `id` must be a theme bundled into shikiHighlighter.ts.
export type CodeTheme = {
  id: string;
  label: string;
  bg: string;
  fg: string;
};

export const CODE_THEMES: CodeTheme[] = [
  { id: 'dark-plus', label: 'Dark+', bg: '#1E1E1E', fg: '#D4D4D4' },
  { id: 'light-plus', label: 'Light+', bg: '#FFFFFF', fg: '#000000' },
  { id: 'github-dark', label: 'GitHub Dark', bg: '#24292e', fg: '#e1e4e8' },
  { id: 'github-light', label: 'GitHub Light', bg: '#ffffff', fg: '#24292e' },
  { id: 'nord', label: 'Nord', bg: '#2e3440', fg: '#d8dee9' },
  { id: 'dracula', label: 'Dracula', bg: '#282A36', fg: '#F8F8F2' },
  { id: 'monokai', label: 'Monokai', bg: '#272822', fg: '#f8f8f2' },
  { id: 'one-dark-pro', label: 'One Dark', bg: '#282c34', fg: '#abb2bf' },
  {
    id: 'catppuccin-mocha',
    label: 'Catppuccin Mocha',
    bg: '#1e1e2e',
    fg: '#cdd6f4'
  },
  {
    id: 'catppuccin-latte',
    label: 'Catppuccin Latte',
    bg: '#eff1f5',
    fg: '#4c4f69'
  },
  { id: 'vitesse-dark', label: 'Vitesse Dark', bg: '#121212', fg: '#dbd7caee' },
  { id: 'tokyo-night', label: 'Tokyo Night', bg: '#1a1b26', fg: '#a9b1d6' }
];

export const DEFAULT_CODE_THEME = 'dark-plus';

export function codeThemeById(id: string): CodeTheme {
  return CODE_THEMES.find((t) => t.id === id) ?? CODE_THEMES[0];
}
