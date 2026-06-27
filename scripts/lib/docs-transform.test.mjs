import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteLinks, deriveFrontmatter, stripLeadingH1, toContentFile } from './docs-transform.mjs';

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

test('relative non-.md repo link (../) rewrites to GitHub blob (no broken site link)', () => {
  // Regression: docs/mcp.md links to a code dir, not a doc. Left untouched it
  // rendered as a site-relative /cmd/sandbox-server 404.
  assert.equal(rewriteLinks('[sandbox-server](../cmd/sandbox-server)', OPTS),
    '[sandbox-server](https://github.com/mitos-run/mitos/blob/main/cmd/sandbox-server)');
});

test('relative non-.md path under docs/ rewrites to GitHub blob in docs/', () => {
  assert.equal(rewriteLinks('[script](scripts/bench.sh)', OPTS),
    '[script](https://github.com/mitos-run/mitos/blob/main/docs/scripts/bench.sh)');
});

test('relative non-.md link keeps its anchor', () => {
  assert.equal(rewriteLinks('[m](../Makefile#targets)', OPTS),
    '[m](https://github.com/mitos-run/mitos/blob/main/Makefile#targets)');
});

test('site-absolute links (/docs/...) are left untouched', () => {
  assert.equal(rewriteLinks('[q](/docs/quickstart)', OPTS), '[q](/docs/quickstart)');
});

test('relative image refs are left untouched (not rewritten to a blob page)', () => {
  assert.equal(rewriteLinks('![diagram](assets/arch.png)', OPTS),
    '![diagram](assets/arch.png)');
});

test('external http links are left untouched', () => {
  assert.equal(rewriteLinks('[site](https://mitos.run)', OPTS),
    '[site](https://mitos.run)');
});

test('in-page anchors are left untouched', () => {
  assert.equal(rewriteLinks('[top](#intro)', OPTS), '[top](#intro)');
});

test('title comes from the first H1, description from the first paragraph', () => {
  const md = '# mitos CLI\n\n`mitos` is the command-line interface for sandboxes. It drives the lifecycle.\n\n## More\n';
  const fm = deriveFrontmatter(md, { slug: 'cli' });
  assert.equal(fm.title, 'mitos CLI');
  assert.equal(fm.description, '`mitos` is the command-line interface for sandboxes. It drives the lifecycle.');
});

test('over-long description is clamped to <= 160 chars at a sentence boundary', () => {
  const long =
    'This is the first sentence and it is comfortably long enough to stand on its own as a meta description for the page. This second sentence pushes the total well past the limit.';
  const fm = deriveFrontmatter('# T\n\n' + long + '\n');
  assert.ok(fm.description.length <= 160, `len=${fm.description.length}`);
  assert.equal(fm.description,
    'This is the first sentence and it is comfortably long enough to stand on its own as a meta description for the page.');
});

test('over-long single-sentence description is clamped at a word boundary with ellipsis', () => {
  const long =
    'Mitos forks a running Firecracker microVM into hundreds of isolated subagents that each get their own kernel and copy on write memory and a fully private network namespace here';
  const fm = deriveFrontmatter('# T\n\n' + long + '\n');
  assert.ok(fm.description.length <= 160, `len=${fm.description.length}`);
  assert.ok(fm.description.endsWith('…'));
  assert.ok(!/\s$/.test(fm.description.slice(0, -1)), 'no dangling space before ellipsis');
  assert.ok(long.startsWith(fm.description.slice(0, -1)), 'is a clean prefix of the source');
});

test('description under the limit is returned unchanged', () => {
  const md = '# T\n\nA short and tidy description.\n';
  assert.equal(deriveFrontmatter(md).description, 'A short and tidy description.');
});

test('description strips markdown emphasis and trailing whitespace', () => {
  const md = '# Title\n\nA **bold** intro line.\n';
  const fm = deriveFrontmatter(md, { slug: 'x' });
  assert.equal(fm.description, 'A bold intro line.');
});

test('fenced code block after H1 is skipped; description is the first prose paragraph', () => {
  const md = [
    '# Architecture',
    '',
    '```mermaid',
    'flowchart TB',
    'subgraph SDKs["SDKs and surfaces"]',
    'end',
    '```',
    '',
    'Sandboxes are not pods — they are lightweight gVisor micro-VMs.',
  ].join('\n');
  const fm = deriveFrontmatter(md);
  assert.equal(fm.description, 'Sandboxes are not pods — they are lightweight gVisor micro-VMs.');
});

test('stripLeadingH1 removes only the first level-1 heading', () => {
  assert.equal(stripLeadingH1('# Title\n\nbody text'), 'body text');
  assert.equal(stripLeadingH1('## Sub\n\nbody text'), '## Sub\n\nbody text');
  assert.equal(stripLeadingH1('no heading here'), 'no heading here');
});

test('toContentFile keeps title in frontmatter but strips the leading H1 from the body', () => {
  const md = '# Quickstart\n\nInstall the SDK.\n\n## Run\n';
  const out = toContentFile({
    md: undefined, markdown: md, slug: 'quickstart', group: 'start', order: 0,
    sourceUrl: 'https://example/quickstart.md', allowSlugs: new Set(), repoBlobBase: 'https://r',
  });
  assert.match(out, /title: "Quickstart"/);     // title preserved in frontmatter
  assert.doesNotMatch(out, /\n# Quickstart\b/);  // no duplicate H1 in the rendered body
  assert.match(out, /Install the SDK\./);        // body prose retained
  assert.match(out, /## Run/);                   // h2 retained (feeds the ToC)
});
