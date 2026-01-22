import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://dusanio.github.io',
  base: '/dusanio.github.io',
  integrations: [tailwind()],
});

