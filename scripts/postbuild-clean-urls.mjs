// Post-build HTML fixup for Astro build.format:'file' output.
//
// With build.format:'file', Astro emits internal hrefs and canonicals as
// `/foo.html`, but the site serves clean, slash-free URLs (and the sitemap
// uses them). That creates duplicate /foo vs /foo.html pages, split
// canonicals, and "same text -> 2 URLs" link warnings. We rewrite internal
// `.html` hrefs/canonicals to the clean form.
//
// Runs as part of `npm run build` (astro build && node scripts/...). Skips the
// Go vanity-import meta (public/mitos) and the OG render target.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SKIP_DIRS = new Set(['mitos']); // go-get meta page, leave untouched
const SKIP_FILES = new Set(['og-template.html']); // noindex render target

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* htmlFiles(join(dir, entry.name));
    } else if (entry.name.endsWith('.html') && !SKIP_FILES.has(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

const cleanUrls = (html) =>
  html
    // /index.html (and origin-qualified) -> root
    .replace(/(href|content)="(https:\/\/mitos\.run)?\/index\.html"/g, '$1="$2/"')
    // internal /path.html -> /path  (not the /mitos/ vanity tree)
    .replace(/(href|content)="(https:\/\/mitos\.run)?(\/(?!mitos\/)[^"]*?)\.html"/g, '$1="$2$3"');

let changed = 0;
for await (const file of htmlFiles(DIST)) {
  const src = await readFile(file, 'utf8');
  const out = cleanUrls(src);
  if (out !== src) {
    await writeFile(file, out);
    changed++;
    console.log('  cleaned', relative(DIST, file));
  }
}
console.log(`postbuild-clean-urls: updated ${changed} file(s).`);
