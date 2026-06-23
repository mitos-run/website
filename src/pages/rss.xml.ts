// RSS 2.0 feed for the blog. Dependency-free; built to /rss.xml and advertised
// via a <link rel="alternate"> in Site.astro. Never use em or en dashes in copy.
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET(context: APIContext) {
  const site = context.site?.toString() ?? 'https://mitos.run/';
  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${site}blog/${p.id}</link>
      <guid>${site}blog/${p.id}</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <description>${esc(p.data.description)}</description>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mitos blog</title>
    <link>${site}blog</link>
    <description>Engineering notes from Mitos: forkable microVM sandboxes for agent swarms.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
