// Post-build guard: every allowlisted slug produced an HTML page, the architecture
// page rendered the diagram, and no internal /docs link 404s within dist.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOWLIST } from './lib/docs-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
let failed = false;
const fail = (m) => { console.error('FAIL:', m); failed = true; };

for (const { slug } of ALLOWLIST) {
  if (!existsSync(join(DIST, 'docs', `${slug}.html`))) fail(`missing dist/docs/${slug}.html`);
}
if (!existsSync(join(DIST, 'docs.html'))) fail('missing dist/docs.html (hub)');

// Collect all generated doc paths, assert internal /docs/<slug> links resolve.
const valid = new Set(ALLOWLIST.map((d) => `/docs/${d.slug}`).concat(['/docs']));
// Expressive Code renders the ```mermaid fence as <pre data-language="mermaid">
// in the STATIC html; the <div class="mermaid"> SVG host is created client-side
// at runtime, so it is NOT present in the built file. Assert the EC attribute.
const archHtml = existsSync(join(DIST, 'docs', 'architecture.html'))
  ? readFileSync(join(DIST, 'docs', 'architecture.html'), 'utf8') : '';
if (archHtml && !/data-language="mermaid"/.test(archHtml)) {
  fail('architecture page has no mermaid block (expected EC <pre data-language="mermaid">)');
}
for (const { slug } of ALLOWLIST) {
  const p = join(DIST, 'docs', `${slug}.html`);
  if (!existsSync(p)) continue;
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(\/docs\/[a-z0-9-]+)"/g)) {
    if (!valid.has(m[1])) fail(`${slug}.html links to unknown internal doc ${m[1]}`);
  }
}

if (failed) process.exit(1);
console.log(`[check-docs-build] OK: ${ALLOWLIST.length} docs + hub built, internal links resolve`);
