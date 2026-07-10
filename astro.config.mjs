// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // sharp can't run inside the workerd dev runtime, so only pre-optimize on build
  adapter: cloudflare({
    imageService: process.argv.includes('dev') ? 'passthrough' : 'compile',
  }),

  vite: {
    plugins: [tailwindcss()]
  }
});