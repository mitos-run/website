// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  // The canonical product domain. This is also the Go vanity import host
  // (mitos.run/mitos); see public/mitos/index.html and the host rewrites.
  site: 'https://mitos.run',
  integrations: [
    starlight({
      title: 'mitos',
      tagline: 'Millisecond microVM sandbox forking for AI agents.',
      logo: {
        light: './src/assets/mitos-mark-on-light.svg',
        dark: './src/assets/mitos-mark-on-dark.svg',
        alt: 'mitos',
      },
      favicon: '/favicon.svg',
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#000000' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://mitos.run/og.png' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'mitos logo with the tagline: agent swarms in milliseconds' } },
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
