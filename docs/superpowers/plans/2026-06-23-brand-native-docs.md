# Brand-native docs (live engine sync) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the off-brand, hand-maintained Starlight docs with a fluorescence-branded `/docs` system whose content is fetched live from the engine repo (`mitos-run/mitos@main`) at build time, so the engine repo is the single source of truth.

**Architecture:** A prebuild script shallow-fetches the engine repo's `docs/` + `README.md`, applies a curated manifest (allowlist + order + groups), transforms each doc (frontmatter, link/asset rewrite), extracts the README `## Architecture` section, and writes the result to a **gitignored** `src/content/engine-docs/`. Astro renders that as a `docs` content collection through a brand `DocsLayout` (Site shell + sidebar + reused blog prose/TOC). The old `/quickstart` and `/architecture` pages are deleted and every internal link is repointed at `/docs/...`; no redirects are needed because no external links point at the old URLs yet.

**Tech Stack:** Astro 6, Astro content collections (glob loader), `astro-expressive-code` (standalone, replaces Starlight's bundled Expressive Code), `mermaid` (client-side, brand-themed, one diagram), Node `node:test` for unit tests, `git` CLI for the sparse fetch. No Starlight.

## Global Constraints

- **Single source of truth:** no engine doc content is ever committed to this repo. The fetch target `src/content/engine-docs/` and `public/docs-assets/` are gitignored. Verbatim.
- **Build fails loudly on fetch failure** — never ship empty or stale docs; no committed fallback snapshot.
- **Brand tokens only:** reference `var(--*)` from `src/styles/tokens.css`; never raw hex. (`docs/brand/brand.md` is canonical.)
- **Copy rule:** never use em or en dashes in any prose/UI copy (matches existing page headers).
- **Clean URLs:** `trailingSlash: 'never'`, `build.format: 'file'`; canonical paths have no `.html` and no trailing slash.
- **Engine repo + branch:** `https://github.com/mitos-run/mitos`, branch `main`. Public.
- **Deploy host is GitHub Pages** (static; CNAME `mitos.run`, `.github/workflows/deploy.yml`). No server redirect engine. `postbuild-clean-urls.mjs` rewrites `.html`→clean URLs for every page and must keep running.
- **No redirects:** the old `/quickstart` and `/architecture` pages are deleted; all references are repointed to `/docs/...`. No external links target the old URLs yet, so no redirect stubs are introduced.

---

### Task 1: Engine-docs sync script

Fetches + transforms engine docs into the gitignored content dir. Pure Node, independently runnable and unit-tested before any Astro change. The build stays green throughout (Starlight is untouched; it ignores `engine-docs/`).

**Files:**
- Create: `scripts/sync-engine-docs.mjs` (orchestrator + CLI entry)
- Create: `scripts/lib/docs-manifest.mjs` (the curated allowlist/order/groups)
- Create: `scripts/lib/docs-transform.mjs` (pure transform functions)
- Create: `scripts/lib/readme-architecture.mjs` (README section extraction)
- Create: `scripts/lib/docs-transform.test.mjs` (node:test unit tests)
- Create: `scripts/lib/readme-architecture.test.mjs` (node:test unit tests)
- Modify: `.gitignore` (add the fetch targets)
- Modify: `package.json` (add `predev`, `prebuild`, `sync:docs`, `test` scripts)

**Interfaces:**
- Produces (consumed by Task 3):
  - Manifest `scripts/lib/docs-manifest.mjs` exports `GROUPS` (ordered) and `ALLOWLIST` (flat ordered slug list with group + order):
    ```js
    export const GROUPS = [
      { id: 'start',      label: 'Start here',  slugs: ['quickstart', 'install', 'architecture'] },
      { id: 'sdk-cli',    label: 'SDK & CLI',   slugs: ['cli', 'mcp'] },
      { id: 'sandboxes',  label: 'Sandboxes',   slugs: ['lifecycle', 'workspaces', 'volumes'] },
      { id: 'networking', label: 'Networking',  slugs: ['networking', 'ports', 'preview-urls'] },
      { id: 'operations', label: 'Operations',  slugs: ['metering', 'observability'] },
      { id: 'security',   label: 'Security',    slugs: ['threat-model'] },
      { id: 'migrating',  label: 'Migrating',   slugs: ['migrating-from-e2b'] },
    ];
    // architecture is sourced from the README, every other slug maps to docs/<slug>.md
    ```
  - `docs-transform.mjs` exports `deriveFrontmatter(markdown, {slug, group, order, sourceUrl})` → `{ title, description }`, `rewriteLinks(markdown, {allowSlugs, repoBlobBase})` → `string`, and `toContentFile({markdown, slug, group, order, sourceUrl, allowSlugs, repoBlobBase})` → full file string (YAML frontmatter + transformed body).
  - `readme-architecture.mjs` exports `extractArchitecture(readme)` → `string` (markdown body of the `## Architecture` section, mermaid fence preserved).
  - On disk: `src/content/engine-docs/<slug>.md` for every allowlisted slug, each with frontmatter `title`, `description`, `slug`, `group`, `order`, `sourceUrl`; plus `src/content/engine-docs/.source-sha` containing the fetched commit SHA.

- [ ] **Step 1: Write failing tests for `rewriteLinks`**

Create `scripts/lib/docs-transform.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteLinks } from './docs-transform.mjs';

const OPTS = {
  allowSlugs: new Set(['threat-model', 'cli', 'quickstart']),
  repoBlobBase: 'https://github.com/mitos-run/mitos/blob/main',
};

test('allowlisted bare .md link rewrites to /docs/<slug>', () => {
  assert.equal(rewriteLinks('see [threat model](threat-model.md).', OPTS),
    'see [threat model](/docs/threat-model).');
});

test('allowlisted link keeps its anchor', () => {
  assert.equal(rewriteLinks('[cli](./cli.md#flags)', OPTS),
    '[cli](/docs/cli#flags)');
});

test('non-allowlisted doc link rewrites to GitHub blob (docs path)', () => {
  assert.equal(rewriteLinks('[husk](husk-pods.md)', OPTS),
    '[husk](https://github.com/mitos-run/mitos/blob/main/docs/husk-pods.md)');
});

test('subdir doc link rewrites to GitHub blob preserving subpath', () => {
  assert.equal(rewriteLinks('[ob](saas/onboarding.md)', OPTS),
    '[ob](https://github.com/mitos-run/mitos/blob/main/docs/saas/onboarding.md)');
});

test('repo-root .md link (../) rewrites to GitHub blob at root', () => {
  assert.equal(rewriteLinks('[contributing](../CONTRIBUTING.md)', OPTS),
    '[contributing](https://github.com/mitos-run/mitos/blob/main/CONTRIBUTING.md)');
});

test('external http links are left untouched', () => {
  assert.equal(rewriteLinks('[site](https://mitos.run)', OPTS),
    '[site](https://mitos.run)');
});

test('in-page anchors are left untouched', () => {
  assert.equal(rewriteLinks('[top](#intro)', OPTS), '[top](#intro)');
});
```

- [ ] **Step 2: Write failing tests for `deriveFrontmatter`**

Append to `scripts/lib/docs-transform.test.mjs`:

```js
import { deriveFrontmatter } from './docs-transform.mjs';

test('title comes from the first H1, description from the first paragraph', () => {
  const md = '# mitos CLI\n\n`mitos` is the command-line interface for sandboxes. It drives the lifecycle.\n\n## More\n';
  const fm = deriveFrontmatter(md, { slug: 'cli' });
  assert.equal(fm.title, 'mitos CLI');
  assert.equal(fm.description, '`mitos` is the command-line interface for sandboxes. It drives the lifecycle.');
});

test('description strips markdown emphasis and trailing whitespace', () => {
  const md = '# Title\n\nA **bold** intro line.\n';
  const fm = deriveFrontmatter(md, { slug: 'x' });
  assert.equal(fm.description, 'A bold intro line.');
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `node --test scripts/lib/docs-transform.test.mjs`
Expected: FAIL — `Cannot find module './docs-transform.mjs'` / export not defined.

- [ ] **Step 4: Implement `scripts/lib/docs-transform.mjs`**

```js
// Pure, dependency-free transforms for engine docs. No fs, no network here so
// the logic is unit-testable in isolation.

const LINK_RE = /\]\(([^)]+)\)/g;

/**
 * Rewrite markdown links:
 *  - bare `name.md` (optionally `./name.md`, with optional #anchor) where `name`
 *    is allowlisted        -> `/docs/name#anchor`
 *  - any other `*.md` link -> GitHub blob URL (so nothing is broken or leaked)
 *  - external / in-page / non-md links -> untouched
 */
export function rewriteLinks(markdown, { allowSlugs, repoBlobBase }) {
  return markdown.replace(LINK_RE, (whole, target) => {
    if (/^(https?:|mailto:|#)/.test(target)) return whole;
    if (!target.includes('.md')) return whole;

    const [path, anchor] = target.split('#');
    const clean = path.replace(/^\.\//, '');
    const bare = clean.match(/^([a-z0-9-]+)\.md$/);
    if (bare && allowSlugs.has(bare[1])) {
      return `](/docs/${bare[1]}${anchor ? '#' + anchor : ''})`;
    }
    // Resolve relative to docs/: `../x.md` -> blob/main/x.md ; `x.md` -> blob/main/docs/x.md
    let repoPath;
    if (clean.startsWith('../')) repoPath = clean.replace(/^\.\.\//, '');
    else repoPath = `docs/${clean}`;
    return `](${repoBlobBase}/${repoPath}${anchor ? '#' + anchor : ''})`;
  });
}

/** First H1 -> title; first non-heading, non-empty paragraph -> description. */
export function deriveFrontmatter(markdown, _opts = {}) {
  const lines = markdown.split('\n');
  const h1 = lines.find((l) => /^#\s+/.test(l));
  const title = h1 ? h1.replace(/^#\s+/, '').trim() : 'Untitled';

  // first paragraph after the H1 that is not a heading/fence/blank
  let desc = '';
  let seenH1 = false;
  for (const l of lines) {
    if (/^#\s+/.test(l)) { seenH1 = true; continue; }
    if (!seenH1) continue;
    const t = l.trim();
    if (!t || t.startsWith('#') || t.startsWith('```') || t.startsWith('<')) {
      if (desc) break; else continue;
    }
    desc += (desc ? ' ' : '') + t;
    // stop at the paragraph break (next line blank handled above)
  }
  // strip inline markdown emphasis/backticks/links for a clean meta description
  desc = desc
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
  return { title, description: desc };
}

function yamlEscape(s) { return String(s).replace(/"/g, '\\"'); }

/** Full content-collection file: YAML frontmatter + transformed body. */
export function toContentFile({ markdown, slug, group, order, sourceUrl, allowSlugs, repoBlobBase }) {
  const { title, description } = deriveFrontmatter(markdown);
  const body = rewriteLinks(markdown, { allowSlugs, repoBlobBase });
  const fm = [
    '---',
    `title: "${yamlEscape(title)}"`,
    `description: "${yamlEscape(description)}"`,
    `slug: "${slug}"`,
    `group: "${group}"`,
    `order: ${order}`,
    `sourceUrl: "${sourceUrl}"`,
    '---',
    '',
  ].join('\n');
  return fm + body;
}
```

- [ ] **Step 5: Run the transform tests, verify they pass**

Run: `node --test scripts/lib/docs-transform.test.mjs`
Expected: PASS (9 tests).

- [ ] **Step 6: Write failing test for `extractArchitecture`**

Create `scripts/lib/readme-architecture.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractArchitecture } from './readme-architecture.mjs';

const README = [
  '# Mitos', '', 'Intro.', '',
  '## Architecture', '',
  '```mermaid', 'flowchart TB', '  A-->B', '```', '',
  '- Claim path: x.', '',
  '## Local development', '', 'other',
].join('\n');

test('extracts the Architecture section body, preserving the mermaid fence', () => {
  const out = extractArchitecture(README);
  assert.match(out, /```mermaid/);
  assert.match(out, /Claim path: x\./);
  assert.doesNotMatch(out, /Local development/);
  assert.doesNotMatch(out, /^## Architecture/m); // heading itself dropped; page H1 added by caller
});

test('throws if there is no Architecture section', () => {
  assert.throws(() => extractArchitecture('# Mitos\n\nno arch here\n'), /Architecture section/);
});
```

- [ ] **Step 7: Run it, verify it fails**

Run: `node --test scripts/lib/readme-architecture.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 8: Implement `scripts/lib/readme-architecture.mjs`**

```js
/**
 * Pull the body of the README's `## Architecture` section (everything from that
 * heading to the next `## `). The heading line itself is dropped; the caller
 * prepends a `# Architecture` H1 so deriveFrontmatter() produces a title.
 */
export function extractArchitecture(readme) {
  const lines = readme.split('\n');
  const start = lines.findIndex((l) => /^##\s+Architecture\s*$/.test(l));
  if (start === -1) throw new Error('README has no "## Architecture" section');
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join('\n').trim();
}
```

- [ ] **Step 9: Run it, verify it passes**

Run: `node --test scripts/lib/readme-architecture.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 10: Create the manifest `scripts/lib/docs-manifest.mjs`**

```js
// Curated public docs IA. Lives in the WEBSITE repo (this is site information
// architecture, not engine content). Only these slugs ever build. `architecture`
// is sourced from the engine README; every other slug maps to docs/<slug>.md.
export const GROUPS = [
  { id: 'start',      label: 'Start here', slugs: ['quickstart', 'install', 'architecture'] },
  { id: 'sdk-cli',    label: 'SDK & CLI',  slugs: ['cli', 'mcp'] },
  { id: 'sandboxes',  label: 'Sandboxes',  slugs: ['lifecycle', 'workspaces', 'volumes'] },
  { id: 'networking', label: 'Networking', slugs: ['networking', 'ports', 'preview-urls'] },
  { id: 'operations', label: 'Operations', slugs: ['metering', 'observability'] },
  { id: 'security',   label: 'Security',   slugs: ['threat-model'] },
  { id: 'migrating',  label: 'Migrating',  slugs: ['migrating-from-e2b'] },
];

// Flat, ordered list with group + global order. `fromReadme` marks the one doc
// extracted from the README instead of docs/<slug>.md.
export const ALLOWLIST = GROUPS.flatMap((g, gi) =>
  g.slugs.map((slug, si) => ({
    slug,
    group: g.id,
    order: gi * 100 + si,
    fromReadme: slug === 'architecture',
  })),
);

export const ALLOW_SLUGS = new Set(ALLOWLIST.map((d) => d.slug));
```

- [ ] **Step 11: Implement the orchestrator `scripts/sync-engine-docs.mjs`**

```js
#!/usr/bin/env node
// Fetch engine docs from mitos-run/mitos@main and transform them into the
// gitignored content collection. Single source of truth: nothing here is
// committed. Fails loudly on any fetch/transform error so the build never ships
// empty or stale docs.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync, cpSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOWLIST, ALLOW_SLUGS } from './lib/docs-manifest.mjs';
import { toContentFile } from './lib/docs-transform.mjs';
import { extractArchitecture } from './lib/readme-architecture.mjs';

const REPO = 'https://github.com/mitos-run/mitos';
const BRANCH = 'main';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/content/engine-docs');
const ASSETS_OUT = join(ROOT, 'public/docs-assets');
const repoBlobBase = `${REPO}/blob/${BRANCH}`;

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
}

function fetchRepo() {
  const tmp = mkdtempSync(join(tmpdir(), 'mitos-docs-'));
  run('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', '-b', BRANCH, `${REPO}.git`, tmp]);
  run('git', ['sparse-checkout', 'set', 'docs', 'README.md'], tmp);
  const sha = run('git', ['rev-parse', 'HEAD'], tmp);
  return { tmp, sha };
}

function main() {
  let repo;
  try {
    repo = fetchRepo();
  } catch (err) {
    console.error('\n[sync-engine-docs] FAILED to fetch engine docs from', REPO, '@', BRANCH);
    console.error(err.message || err);
    process.exit(1); // fail the build loudly; never ship empty docs
  }
  const { tmp, sha } = repo;

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  rmSync(ASSETS_OUT, { recursive: true, force: true });
  mkdirSync(ASSETS_OUT, { recursive: true });

  const readme = readFileSync(join(tmp, 'README.md'), 'utf8');

  for (const { slug, group, order, fromReadme } of ALLOWLIST) {
    let markdown;
    if (fromReadme) {
      markdown = `# Architecture\n\n${extractArchitecture(readme)}\n`;
    } else {
      const src = join(tmp, 'docs', `${slug}.md`);
      if (!existsSync(src)) {
        console.error(`\n[sync-engine-docs] allowlisted doc "${slug}" not found at docs/${slug}.md upstream.`);
        console.error('Update scripts/lib/docs-manifest.mjs (the doc was renamed or removed).');
        rmSync(tmp, { recursive: true, force: true });
        process.exit(1);
      }
      markdown = readFileSync(src, 'utf8');
    }
    const sourceUrl = fromReadme ? `${repoBlobBase}/README.md#architecture` : `${repoBlobBase}/docs/${slug}.md`;
    const file = toContentFile({ markdown, slug, group, order, sourceUrl, allowSlugs: ALLOW_SLUGS, repoBlobBase });
    writeFileSync(join(OUT, `${slug}.md`), file);
  }

  // Copy any referenced assets (best-effort; rewrite handled by referencing docs).
  const assetsDir = join(tmp, 'docs/assets');
  if (existsSync(assetsDir)) {
    for (const f of readdirSync(assetsDir)) cpSync(join(assetsDir, f), join(ASSETS_OUT, f));
  }

  writeFileSync(join(OUT, '.source-sha'), sha + '\n');
  rmSync(tmp, { recursive: true, force: true });
  console.log(`[sync-engine-docs] wrote ${ALLOWLIST.length} docs from ${REPO}@${sha.slice(0, 8)}`);
}

main();
```

- [ ] **Step 12: Add gitignore entries**

In `.gitignore` add:

```
# Engine docs are fetched at build time from mitos-run/mitos@main (single
# source of truth) and must never be committed here.
src/content/engine-docs/
public/docs-assets/
```

- [ ] **Step 13: Wire npm scripts**

In `package.json`, set `scripts` to:

```json
  "scripts": {
    "sync:docs": "node scripts/sync-engine-docs.mjs",
    "predev": "node scripts/sync-engine-docs.mjs",
    "dev": "astro dev",
    "prebuild": "node scripts/sync-engine-docs.mjs",
    "build": "astro build && node scripts/postbuild-clean-urls.mjs",
    "preview": "astro preview",
    "astro": "astro",
    "test": "node --test scripts/lib/*.test.mjs"
  },
```

- [ ] **Step 14: Run the sync end-to-end and verify output**

Run: `npm run sync:docs`
Expected: prints `wrote 15 docs from mitos-run/mitos@<sha>`; `src/content/engine-docs/quickstart.md` exists with YAML frontmatter (`title`, `description`, `slug`, `group`, `order`, `sourceUrl`) and `architecture.md` contains a ```mermaid fence. (If an allowlisted slug is missing upstream, the script exits 1 naming it — update the manifest and rerun.)

- [ ] **Step 15: Run the full test suite, verify green**

Run: `npm test`
Expected: PASS (11 tests across both files).

- [ ] **Step 16: Verify the existing build is still green (Starlight untouched)**

Run: `npm run build`
Expected: build succeeds; existing `/quickstart` and `/architecture` still render via Starlight (engine-docs is not yet wired in).

- [ ] **Step 17: Commit**

```bash
git add scripts/ .gitignore package.json package-lock.json
git commit -m "feat(docs): engine-docs sync script (fetch + transform + tests)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Extract shared prose stylesheet

The blog's `.prose` + TOC rail is exactly what docs need. Extract it to a shared stylesheet so docs and blog stay identical and DRY. Isolated, reviewable change; blog must render unchanged after.

**Files:**
- Create: `src/styles/prose.css`
- Modify: `src/pages/blog/[slug].astro` (remove the now-shared rules, import the stylesheet)

**Interfaces:**
- Produces: `src/styles/prose.css` exporting the `.prose` rules (paragraph/heading/link/list/code/table styling) and the `.toc`/`.toc-rail`/`.article`/`.article-main` layout rules, all using `var(--*)` tokens. Imported by both `blog/[slug].astro` (Task 2) and `DocsLayout.astro` (Task 3).

- [ ] **Step 1: Create `src/styles/prose.css`**

Move these exact rule blocks out of `src/pages/blog/[slug].astro`'s `<style>` into a global stylesheet (drop the `:global()` wrappers since this file is already global):

```css
/* Shared article prose + sticky ToC rail. Used by /blog and /docs.
   Brand tokens only (see docs/brand/brand.md). */
.article { padding-top: 26px; padding-bottom: 8px; }
.article.has-toc { display: grid; grid-template-columns: minmax(0, 52em) minmax(0, 200px); gap: 56px; align-items: start; }
.article-main { min-width: 0; }

.toc-rail { position: sticky; top: 96px; }
.toc-h { color: var(--ink-3); font-size: var(--text-micro); margin: 0 0 12px; }
.toc ol { margin: 0; padding: 0; list-style: none; counter-reset: toc; display: grid; gap: 9px; }
.toc li { counter-increment: toc; display: flex; gap: 11px; align-items: baseline; }
.toc li::before { content: counter(toc, decimal-leading-zero); color: var(--ink-3); font-family: var(--mono); font-size: var(--text-nano); flex: none; }
.toc a { color: var(--ink-2); font-size: var(--text-dense); line-height: 1.4; transition: color .14s var(--ease); }
.toc a:hover { color: var(--magenta); }
.toc a.active { color: var(--magenta); }
.toc li:has(a.active)::before { color: var(--magenta); }

.prose { max-width: 52em; }
.prose p { color: var(--ink-2); font-size: var(--text-body); line-height: 1.7; margin: 0 0 22px; }
.prose strong { color: var(--ink); font-weight: 500; }
.prose a { color: var(--cyan); border-bottom: 1px solid color-mix(in srgb, var(--cyan) 30%, transparent); }
.prose a:hover { border-bottom-color: var(--cyan); }
.prose h2 { font-size: var(--text-h3); font-weight: 400; letter-spacing: var(--track-display); margin: 40px 0 14px; color: var(--ink); }
.prose h3 { font-size: var(--text-title); font-weight: 500; margin: 28px 0 10px; color: var(--ink); }
.prose ul, .prose ol { color: var(--ink-2); font-size: var(--text-body); line-height: 1.7; margin: 0 0 22px; padding-left: 22px; }
.prose li { margin: 0 0 8px; }
.prose .expressive-code { margin: 0 0 22px; }
.prose :not(pre) > code { font-family: var(--mono); font-size: var(--text-code); color: var(--ink); background: var(--field-2); padding: 2px 6px; border-radius: var(--r-sm); }
.prose table { width: 100%; border-collapse: collapse; font-size: var(--text-dense); margin: 0 0 24px; display: block; overflow-x: auto; }
.prose th, .prose td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--hairline); vertical-align: top; }
.prose thead th { color: var(--ink-3); font-weight: 500; font-size: var(--text-micro); text-transform: uppercase; letter-spacing: .04em; background: var(--field-1); }
.prose tbody tr:last-child td { border-bottom: none; }
.prose blockquote { border-left: 2px solid var(--hairline-strong); padding-left: 16px; margin: 0 0 22px; color: var(--ink-2); }

@media (max-width: 1000px) {
  .article.has-toc { grid-template-columns: 1fr; gap: 0; }
  .toc-rail { position: static; order: -1; margin-bottom: 28px; }
}
```

(`h3` and `blockquote` rules are added because engine docs use them; blog will inherit them harmlessly.)

- [ ] **Step 2: Update `src/pages/blog/[slug].astro` to use the shared stylesheet**

Add the import to the frontmatter (top, with other imports):

```js
import '../../styles/prose.css';
```

Then delete the rule blocks now in `prose.css` from the page's `<style>`: the `.article`, `.article.has-toc`, `.article-main`, `.toc-rail`, `.toc-h`, `.toc ol/li/li::before`, `.toc a` variants, the entire `.prose ...` set, and the `@media (max-width: 1000px)` block. Keep the blog-only rules (`.page-hero`, `.back`, `.art-cat`, `.byline`, `.post-faq*`, `.faq-item*`, `.tags`, `.tag`, `.related`, `.rel-*`, and the `@media (max-width: 700px)` block).

- [ ] **Step 3: Build and verify the blog renders unchanged**

Run: `npm run build`
Expected: build succeeds.
Run: `node scripts/cdp-shot.mjs 1280 /tmp/blog-before.png http://localhost:4321/blog/fork-dont-rebuild` (after `npm run preview` in another shell) — visually confirm prose, links (cyan), and the TOC rail look exactly as before.

- [ ] **Step 4: Commit**

```bash
git add src/styles/prose.css src/pages/blog/[slug].astro
git commit -m "refactor(docs): extract shared .prose + ToC stylesheet

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Brand docs system (drop Starlight, render /docs)

The atomic swap: remove Starlight, add standalone Expressive Code, wire the `docs` content collection, and ship the branded `DocsLayout`, `/docs/[...slug]`, and `/docs` hub. This must land together because removing Starlight removes the old `docs` collection and the EC integration the blog relies on; the build is green again at task end.

**Files:**
- Modify: `astro.config.mjs` (remove starlight, add `astro-expressive-code` + direct `@astrojs/sitemap`)
- Modify: `src/content.config.ts` (replace starlight `docs` collection with a glob collection)
- Create: `src/layouts/DocsLayout.astro`
- Create: `src/pages/docs/[...slug].astro`
- Create: `src/pages/docs/index.astro`
- Delete: `src/content/docs/architecture.md`, `src/content/docs/quickstart.md`, `src/components/starlight/Footer.astro`
- Modify: `package.json` (deps: remove `@astrojs/starlight`; add `astro-expressive-code`, `mermaid`)

**Interfaces:**
- Consumes (from Task 1): `src/content/engine-docs/<slug>.md` with frontmatter `{title, description, slug, group, order, sourceUrl}`; `.source-sha`.
- Consumes (from Task 2): `src/styles/prose.css`.
- Consumes (from Task 1 manifest): `GROUPS` from `scripts/lib/docs-manifest.mjs` (imported by the sidebar). Re-export it for app code via `src/data/docs-nav.ts`:
  ```ts
  export { GROUPS } from '../../scripts/lib/docs-manifest.mjs';
  ```

- [ ] **Step 1: Install dependencies**

Run: `npm install astro-expressive-code mermaid && npm uninstall @astrojs/starlight`
Expected: `package.json` deps now include `astro-expressive-code` and `mermaid`, and no longer include `@astrojs/starlight`.

- [ ] **Step 2: Replace the `docs` collection in `src/content.config.ts`**

```ts
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
```

- [ ] **Step 3: Rewrite `astro.config.mjs` (no Starlight)**

```js
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
```

- [ ] **Step 4: Create `src/data/docs-nav.ts`**

```ts
// Re-export the curated docs IA for app code. Source of order/grouping is the
// sync manifest so the sidebar and the build agree.
export { GROUPS } from '../../scripts/lib/docs-manifest.mjs';
```

- [ ] **Step 5: Create `src/layouts/DocsLayout.astro`**

```astro
---
// /docs/<slug> shell: Site brand frame + left sidebar (from the manifest) +
// reused .prose body and sticky ToC rail. Mermaid (one diagram on the
// architecture page) renders client-side, brand-themed. Never use em/en dashes.
import Site from './Site.astro';
import { GROUPS } from '../data/docs-nav';
import { getCollection } from 'astro:content';
import '../styles/prose.css';

interface Props {
  title: string;
  description: string;
  sourceUrl: string;
  slug: string;
  headings: { depth: number; slug: string; text: string }[];
}
const { title, description, sourceUrl, slug, headings } = Astro.props;
const toc = headings.filter((h) => h.depth === 2);

// Build the sidebar from the manifest, resolving titles from the collection.
const all = await getCollection('docs');
const bySlug = new Map(all.map((d) => [d.data.slug, d.data.title]));
const groups = GROUPS
  .map((g) => ({
    label: g.label,
    items: g.slugs.filter((s) => bySlug.has(s)).map((s) => ({ slug: s, title: bySlug.get(s) })),
  }))
  .filter((g) => g.items.length);

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    author: { '@type': 'Organization', name: 'Mitos', url: 'https://mitos.run' },
    publisher: { '@type': 'Organization', name: 'Mitos' },
    mainEntityOfPage: `https://mitos.run/docs/${slug}`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Mitos', item: 'https://mitos.run' },
      { '@type': 'ListItem', position: 2, name: 'Docs', item: 'https://mitos.run/docs' },
      { '@type': 'ListItem', position: 3, name: title, item: `https://mitos.run/docs/${slug}` },
    ],
  },
];
---

<Site title={`${title} · Mitos docs`} description={description} schema={schema}>
  <section class="docs container">
    <aside class="docs-side">
      <nav aria-label="Docs">
        {groups.map((g) => (
          <div class="side-group">
            <p class="side-h mono">{g.label}</p>
            <ul>
              {g.items.map((it) => (
                <li>
                  <a href={`/docs/${it.slug}`} class:list={[it.slug === slug && 'current']}>{it.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>

    <div class:list={['docs-body', toc.length > 0 && 'has-toc']}>
      <div class="article-main">
        <h1 class="docs-title">{title}</h1>
        <article class="prose">
          <slot />
        </article>
        <p class="src mono">
          <a href={sourceUrl}>View source on GitHub &rarr;</a>
        </p>
      </div>
      {toc.length > 0 && (
        <aside class="toc-rail">
          <nav class="toc" aria-label="On this page">
            <p class="toc-h">On this page</p>
            <ol>{toc.map((h) => <li><a href={`#${h.slug}`}>{h.text}</a></li>)}</ol>
          </nav>
        </aside>
      )}
    </div>
  </section>

  <script>
    // Scrollspy for the ToC (same behavior as the blog).
    const links = Array.from(document.querySelectorAll('.toc a'));
    const hs = Array.from(document.querySelectorAll('.prose h2[id]'));
    if (links.length && hs.length) {
      const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
      let active = null;
      const io = new IntersectionObserver((entries) => {
        const on = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = on[0]?.target.id;
        if (id && id !== active && byId.has(id)) {
          active = id;
          links.forEach((a) => a.classList.remove('active'));
          byId.get(id).classList.add('active');
        }
      }, { rootMargin: '-90px 0px -68% 0px', threshold: 0 });
      hs.forEach((h) => io.observe(h));
    }
  </script>

  <!-- Render any ```mermaid blocks client-side, brand-themed. Astro renders a
       mermaid fence as <pre class="language-mermaid"><code>...; convert then init. -->
  <script>
    const blocks = Array.from(document.querySelectorAll('pre > code.language-mermaid, code.language-mermaid'));
    if (blocks.length) {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          background: 'transparent',
          primaryColor: '#0A0C12',          // --field-1
          primaryBorderColor: 'rgba(255,255,255,.14)', // --hairline-strong
          primaryTextColor: 'rgba(255,255,255,.94)',   // --ink
          lineColor: 'rgba(255,255,255,.40)',          // --ink-3
          tertiaryColor: '#11141C',         // --field-2
          fontFamily: 'var(--mono)',
        },
      });
      blocks.forEach((code, i) => {
        const host = document.createElement('div');
        host.className = 'mermaid';
        host.textContent = code.textContent || '';
        const pre = code.closest('pre') || code;
        pre.replaceWith(host);
      });
      await mermaid.run({ querySelector: '.mermaid' });
    }
  </script>
</Site>

<style>
  .docs { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 48px; padding-top: 36px; padding-bottom: 96px; align-items: start; }
  .docs-side { position: sticky; top: 96px; }
  .side-group { margin-bottom: 24px; }
  .side-h { color: var(--ink-3); font-size: var(--text-micro); letter-spacing: .04em; text-transform: uppercase; margin: 0 0 10px; }
  .docs-side ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; }
  .docs-side a { color: var(--ink-2); font-size: var(--text-dense); line-height: 1.4; transition: color .14s var(--ease); }
  .docs-side a:hover { color: var(--ink); }
  .docs-side a.current { color: var(--magenta); }

  .docs-body.has-toc { display: grid; grid-template-columns: minmax(0, 52em) minmax(0, 200px); gap: 56px; align-items: start; }
  .docs-title { font-size: var(--text-h2); font-weight: 400; letter-spacing: var(--track-display); margin: 0 0 24px; }
  .src { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--hairline); }
  .src a { color: var(--ink-3); font-size: var(--text-caption); }
  .src a:hover { color: var(--cyan); }
  .mermaid { margin: 0 0 22px; }

  @media (max-width: 1000px) {
    .docs { grid-template-columns: 1fr; gap: 0; }
    .docs-side { position: static; margin-bottom: 28px; }
    .docs-body.has-toc { grid-template-columns: 1fr; gap: 0; }
    .toc-rail { position: static; order: -1; margin-bottom: 28px; }
  }
</style>
```

- [ ] **Step 6: Create `src/pages/docs/[...slug].astro`**

```astro
---
import DocsLayout from '../../layouts/DocsLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((doc) => ({ params: { slug: doc.data.slug }, props: { doc } }));
}

const { doc } = Astro.props;
const { Content, headings } = await render(doc);
---

<DocsLayout
  title={doc.data.title}
  description={doc.data.description}
  sourceUrl={doc.data.sourceUrl}
  slug={doc.data.slug}
  headings={headings}
>
  <Content />
</DocsLayout>
```

- [ ] **Step 7: Create `src/pages/docs/index.astro` (branded hub)**

```astro
---
// /docs hub: grouped cards linking into the engine-sourced docs. Brand shell.
import Site from '../../layouts/Site.astro';
import { GROUPS } from '../../data/docs-nav';
import { getCollection } from 'astro:content';

const TITLE = 'Mitos docs: forkable microVM sandboxes for AI agents';
const DESC = 'Quickstart, SDK and CLI reference, sandbox lifecycle, networking, and security for Mitos. Sourced from the open engine repository.';

const all = await getCollection('docs');
const meta = new Map(all.map((d) => [d.data.slug, d.data]));
const groups = GROUPS
  .map((g) => ({ label: g.label, items: g.slugs.map((s) => meta.get(s)).filter(Boolean) }))
  .filter((g) => g.items.length);
---

<Site title={TITLE} description={DESC}>
  <section class="hero container">
    <h1>Documentation</h1>
    <p class="lede">Everything to run, fork, and operate Mitos sandboxes. Sourced live from the open engine repository.</p>
  </section>
  <section class="container groups">
    {groups.map((g) => (
      <div class="group">
        <h2 class="group-h">{g.label}</h2>
        <div class="cards">
          {g.items.map((d) => (
            <a class="card" href={`/docs/${d.slug}`}>
              <span class="card-title">{d.title}</span>
              <span class="card-desc">{d.description}</span>
            </a>
          ))}
        </div>
      </div>
    ))}
  </section>
</Site>

<style>
  .hero { padding-top: 64px; padding-bottom: 8px; }
  .hero h1 { font-size: var(--text-h1); font-weight: 300; letter-spacing: var(--track-display); margin: 0 0 14px; }
  .lede { color: var(--ink-2); font-size: var(--text-lede); line-height: 1.5; max-width: 40em; }
  .groups { padding-top: 40px; padding-bottom: 96px; }
  .group { margin-bottom: 44px; }
  .group-h { font-size: var(--text-h3); font-weight: 400; letter-spacing: var(--track-display); margin: 0 0 18px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .card { display: flex; flex-direction: column; gap: 6px; border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 20px; transition: border-color .14s var(--ease), transform .14s var(--ease); }
  .card:hover { border-color: var(--magenta); transform: translateY(-2px); }
  .card-title { color: var(--ink); font-size: var(--text-body); font-weight: 500; }
  .card-desc { color: var(--ink-2); font-size: var(--text-dense); line-height: 1.5; }
</style>
```

- [ ] **Step 8: Delete the obsolete Starlight files**

```bash
git rm src/content/docs/architecture.md src/content/docs/quickstart.md src/components/starlight/Footer.astro
```

(If `src/components/starlight/` is now empty, remove the directory too.)

- [ ] **Step 9: Build and verify the docs render in-brand**

Run: `npm run build`
Expected: build succeeds; `dist/docs/quickstart.html`, `dist/docs/architecture.html`, and `dist/docs.html` exist.
Run (in another shell): `npm run preview`, then `node scripts/cdp-shot.mjs 1280 /tmp/docs-quickstart.png http://localhost:4321/docs/quickstart` and `... /tmp/docs-arch.png http://localhost:4321/docs/architecture`.
Expected: docs render on the true-black field with Satoshi/Geist Mono, magenta/cyan accents, left sidebar, sticky ToC, branded code blocks; the architecture page shows the mermaid diagram brand-themed.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(docs): brand-native /docs system, drop Starlight

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Repoint internal links to /docs

The old `/quickstart` and `/architecture` pages no longer exist (deleted in Task 3). Update every in-site reference to point under `/docs`. No redirects (no external links target the old URLs yet). Reviewable on its own (link-target edits only).

**Files:**
- Modify: `src/layouts/Site.astro` (`DOCS`, `SIGNUP` consts; nav already uses `DOCS`)
- Modify: `src/components/SiteFooter.astro` (Developers links)
- Modify: `src/pages/index.astro` (`DOCS`, `SIGNUP`, the "Read the architecture" button, `softwareHelp`)
- Modify: `src/pages/compare/[slug].astro` (`ENGINE`, "Read the architecture" button)
- Modify: `src/pages/pricing.astro`, `src/pages/alternatives.astro`, `src/pages/about.astro`, `src/pages/benchmarks.astro`, `src/pages/contact.astro`, `src/pages/404.astro` (`/quickstart` references — both `href="..."` and `href: '...'` object-property forms)
- Modify: `src/content/blog/fork-dont-rebuild.md` (the `[quickstart](/quickstart)` body link)

**Interfaces:** none (link target edits only).

- [ ] **Step 1: Update `src/layouts/Site.astro` consts**

Change:
```js
const DOCS = '/quickstart';
const SIGNUP = '/quickstart'; // TODO: hosted console signup when live
```
to:
```js
const DOCS = '/docs';
const SIGNUP = '/docs/quickstart'; // TODO: hosted console signup when live
```

- [ ] **Step 2: Update `src/components/SiteFooter.astro` Developers links**

Change the three doc links to:
```js
      { label: 'Docs', href: '/docs' },
      { label: 'Quickstart', href: '/docs/quickstart' },
      { label: 'Architecture', href: '/docs/architecture' },
```

- [ ] **Step 3: Update remaining `/quickstart` and `/architecture` references**

Replace the targets. The rule: a bare docs-landing reference (`DOCS` const, nav) goes to `/docs`; everything that pointed at the quickstart page goes to `/docs/quickstart`; everything that pointed at the architecture page goes to `/docs/architecture`.

- `src/pages/index.astro`: `const DOCS = '/quickstart'` → `'/docs'`; `const SIGNUP = '/quickstart'` → `'/docs/quickstart'`; `softwareHelp: 'https://mitos.run/quickstart'` → `'https://mitos.run/docs/quickstart'`; `href="/architecture"` → `href="/docs/architecture"`.
- `src/pages/compare/[slug].astro`: `const ENGINE = '/quickstart'` → `'/docs/quickstart'`; `href="/architecture"` → `href="/docs/architecture"`.
- `src/pages/pricing.astro`: `const SIGNUP = '/quickstart'` → `'/docs/quickstart'`; `const DOCS = '/quickstart'` → `'/docs'`.
- `src/pages/alternatives.astro`: `const ENGINE = '/quickstart'` → `'/docs/quickstart'`.
- `src/pages/about.astro`, `src/pages/benchmarks.astro`, `src/pages/contact.astro`: each `href="/quickstart"` → `href="/docs/quickstart"`.
- `src/pages/404.astro`: the links-array entry `{ label: 'Quickstart', href: '/quickstart' }` → `href: '/docs/quickstart'`, AND the button `href="/quickstart"` → `href="/docs/quickstart"`.
- `src/content/blog/fork-dont-rebuild.md`: the body link `[quickstart](/quickstart)` → `[quickstart](/docs/quickstart)`.

Verify none remain (whole repo, excluding the planning docs and the gitignored fetch dir):
Run: `grep -rn "/quickstart\|/architecture" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=.astro --exclude-dir=engine-docs | grep -v "docs/superpowers/"`
Expected: no matches (every reference now points under `/docs`).

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: build succeeds; no `dist/quickstart.html` or `dist/architecture.html` exist (old pages gone). Spot-check `dist/index.html` "Read the architecture" links to `/docs/architecture`, nav "Docs" → `/docs`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(docs): repoint all internal links to /docs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Build-integrity smoke test

A guard so a future manifest/transform change can't silently ship broken docs.

**Files:**
- Create: `scripts/check-docs-build.mjs`
- Modify: `package.json` (add `check:docs`)
- Modify: `.github/workflows/*` (run sync + build + check in CI) — inspect the existing workflow and add the step matching its style.

**Interfaces:** none (CI guard).

- [ ] **Step 1: Implement `scripts/check-docs-build.mjs`**

```js
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
```

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`, add:
```json
    "check:docs": "node scripts/check-docs-build.mjs",
```

- [ ] **Step 3: Run the full pipeline locally**

Run: `npm run sync:docs && npm run build && npm run check:docs`
Expected: sync writes docs, build succeeds, check prints `OK: 15 docs + hub built, internal links resolve`.

- [ ] **Step 4: Add the check to CI**

Read `.github/workflows/` and add, after the existing build step, steps matching the workflow's style:
```yaml
      - run: npm test
      - run: npm run check:docs
```
(The build step already runs `prebuild` → sync. Ensure the CI runner has `git` available — it does on GitHub-hosted runners.)

- [ ] **Step 5: Commit**

```bash
git add scripts/check-docs-build.mjs package.json .github/
git commit -m "test(docs): post-build integrity check + CI wiring

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Build-time fetch of main → Task 1 (`fetchRepo`). ✓
- Gitignored single source of truth → Task 1 Step 12. ✓
- Curated allowlist + order + groups → Task 1 manifest. ✓
- Fail loudly on fetch failure → Task 1 `main()` try/catch + manifest-miss exit. ✓
- Link rewrite (allowlisted → /docs, else GitHub) + asset copy → Task 1 `rewriteLinks` + asset copy. ✓
- README architecture extraction + mermaid → Task 1 `extractArchitecture`, rendered client-side in Task 3. ✓
- Drop Starlight, custom brand render → Task 3. ✓
- Expressive Code preserved for docs + blog → Task 3 Step 3 (standalone integration). ✓
- Reuse blog prose/TOC → Task 2 (`prose.css`) + Task 3 DocsLayout. ✓
- `/docs` hub + `/docs/<slug>` → Task 3 Steps 6–7. ✓
- Internal link repoint (old pages deleted, no redirects — no external inbound links yet) → Task 4. ✓
- Testing: unit (Task 1), smoke (Task 5), brand pass (Task 3 Step 9 screenshots). ✓
- Out of scope (search, versioning) → not built. ✓

**Placeholder scan:** No TBD/TODO-as-work; the one `TODO` retained is the pre-existing `SIGNUP` hosted-console marker (intentional). Every code step shows full code.

**Type consistency:** `toContentFile`/`deriveFrontmatter`/`rewriteLinks`/`extractArchitecture` signatures match between Task 1 definition and call sites. Frontmatter fields (`title, description, slug, group, order, sourceUrl`) match the Zod schema in Task 3 Step 2 and the `DocsLayout` Props. `GROUPS` shape (`{id,label,slugs}`) is consistent across manifest, `docs-nav.ts`, DocsLayout, and hub. `headings` shape matches Astro's `render()` return used in blog.

**Open refinement (non-blocking):** the manifest allowlist (15 slugs across 7 groups) is the first-pass IA from the spec; confirm against the live `docs/` during Task 1 Step 14 (the sync errors loudly if a slug is missing upstream, so drift surfaces immediately).
