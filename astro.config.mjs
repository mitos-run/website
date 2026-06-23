// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  // Canonical product domain; also the Go vanity import host (mitos.run/mitos).
  site: 'https://mitos.run',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    // Brand-themed code blocks for ALL markdown (docs + blog). Must be listed
    // before any markdown is processed. Carried over from the old Starlight EC config.
    expressiveCode({
      themes: ['github-dark-default'],
      styleOverrides: {
        codeBackground: 'var(--field-1)',
        borderColor: 'var(--hairline)',
        borderRadius: 'var(--r-md)',
      },
    }),
    sitemap({
      filter: (page) => !page.includes('/og-template'),
    }),
  ],
});
