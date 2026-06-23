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
