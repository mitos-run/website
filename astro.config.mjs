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
