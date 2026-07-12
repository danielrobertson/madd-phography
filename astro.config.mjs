// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // absolute URLs for canonical/og tags — keep in sync with SITE_URL in src/consts.ts
  site: 'https://madd-photography.danielrobertson733.workers.dev',

  // sharp can't run inside the workerd dev runtime, so only pre-optimize on build
  adapter: cloudflare({
    imageService: process.argv.includes('dev') ? 'passthrough' : 'compile',
  }),

  vite: {
    plugins: [tailwindcss()]
  }
});