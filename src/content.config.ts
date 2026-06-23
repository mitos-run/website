import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/engine-docs' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      group: z.string(),
      order: z.number(),
      sourceUrl: z.string().url(),
    }),
  }),
  blog: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      category: z.string().default('engineering'),
      tags: z.array(z.string()).default([]),
      author: z.string().default('Mitos team'),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      draft: z.boolean().default(false),
    }),
  }),
};
