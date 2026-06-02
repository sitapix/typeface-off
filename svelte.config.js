import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    // For a GitHub Pages *project* site (you.github.io/REPO) build with
    // BASE_PATH=/REPO so asset + self-hosted-font URLs resolve. Defaults to ''
    // (root): correct for a user/org page or a custom domain.
    paths: { base: process.env.BASE_PATH || '' },
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    })
  }
};
