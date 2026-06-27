// Post-build HTML fixup for Astro build.format:'file' output.
//
// With build.format:'file', Astro emits internal hrefs and canonicals as
// `/foo.html`, but the site serves clean, slash-free URLs (and the sitemap
// uses them). That creates duplicate /foo vs /foo.html pages, split
// canonicals, and "same text -> 2 URLs" link warnings. We rewrite internal
// `.html` hrefs/canonicals to the clean form.
//
// Use-case pages are additionally moved from dist/use-cases/slug.html to
// dist/use-cases/slug/index.html so they can be served from clean directory
// paths (/use-cases/slug/) by any static host.
//
// Runs as part of `npm run build` (astro build && node scripts/...). Skips the
// Go vanity-import meta (public/mitos) and the OG render target.
import { readdir, readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join, relative, basename, dirname } from 'node:path';

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

// Move dist/use-cases/<slug>.html -> dist/use-cases/<slug>/index.html so
// static hosts can serve the page from /use-cases/<slug>/ without server config.
const UC_DIR = join(DIST, 'use-cases');
try {
  for (const entry of await readdir(UC_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html') || entry.name === 'index.html') continue;
    const slug = basename(entry.name, '.html');
    const src = join(UC_DIR, entry.name);
    const destDir = join(UC_DIR, slug);
    const dest = join(destDir, 'index.html');
    await mkdir(destDir, { recursive: true });
    await rename(src, dest);
    console.log(`  moved use-cases/${entry.name} -> use-cases/${slug}/index.html`);
  }
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
  // use-cases directory does not exist yet; nothing to move.
}

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
