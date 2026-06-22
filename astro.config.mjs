// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The canonical product domain. This is also the Go vanity import host
  // (mitos.run/mitos); see public/mitos/index.html and the host rewrites.
  site: 'https://mitos.run',
  // Clean URLs without a trailing slash (e.g. /pricing, not /pricing/).
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    // Starlight detects @astrojs/sitemap and uses this config. Drop the OG
    // render target (/og-template) so it never enters the index.
    sitemap({
      filter: (page) => !page.includes('/og-template'),
    }),
    starlight({
      title: 'mitos',
      tagline: 'Millisecond microVM sandbox forking for AI agents.',
      logo: {
        light: './src/assets/mitos-mark-on-light.svg',
        dark: './src/assets/mitos-mark-on-dark.svg',
        alt: 'mitos',
      },
      favicon: '/favicon.svg',
      // Mount the consent-gated PostHog analytics on docs pages too (they use
      // Starlight's layout, not Site.astro). See src/components/starlight/Footer.astro.
      components: {
        Footer: './src/components/starlight/Footer.astro',
      },
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#04050A' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://mitos.run/og.png' } },
        { tag: 'meta', attrs: { property: 'og:image:secure_url', content: 'https://mitos.run/og.png' } },
        { tag: 'meta', attrs: { property: 'og:image:type', content: 'image/png' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'mitos: fork a running microVM into an agent swarm' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://mitos.run/og.png' } },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          // CONFIRM at org-migration time: this must match the real repo home.
          href: 'https://github.com/mitos-run/mitos',
        },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Quickstart', slug: 'quickstart' },
            { label: 'Architecture', slug: 'architecture' },
          ],
        },
      ],
    }),
  ],
});
