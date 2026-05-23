import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://wearemorethanfood.com',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  image: {
    // Allow Astro's built-in image optimization for local assets
    domains: [],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
