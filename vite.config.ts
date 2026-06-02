import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
    port: 9000
  },
  plugins: [tailwindcss(), sveltekit()]
});
