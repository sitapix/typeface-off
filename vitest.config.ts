import { defineConfig } from 'vitest/config';

// Unit tests for pure logic (no Svelte components), so we skip the SvelteKit
// plugin entirely and run plain TS in Node.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
