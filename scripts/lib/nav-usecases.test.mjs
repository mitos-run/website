import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const HOME = 'dist/index.html';

test('header renders the Use cases panel with the rollouts link', () => {
  assert.ok(existsSync(HOME), 'run npm run build first');
  const html = readFileSync(HOME, 'utf8');
  assert.ok(/Use cases/.test(html), 'Use cases trigger missing');
  assert.ok(html.includes('/use-cases/rollouts'), 'rollouts link missing from nav');
  assert.ok(/aria-expanded/.test(html), 'dropdown trigger must be accessible');
});
