// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// `site` es obligatorio para que el sitemap y las URLs canónicas se generen
// absolutas. Se sobreescribe con PUBLIC_SITE_URL en Vercel.
const SITE = process.env.PUBLIC_SITE_URL || 'https://visit-tehuacan.vercel.app';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  server: {
    port: 4500,
  },
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
