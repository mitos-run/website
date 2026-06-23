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
  run('git', ['sparse-checkout', 'set', '--no-cone', 'docs/**', '/README.md'], tmp);
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
