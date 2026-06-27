import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const HOME = 'dist/index.html';

// The Use cases nav is intentionally hidden for now (SHOW_USE_CASES=false in
// src/layouts/Site.astro) while the use-case surface is iterated on. When it is
// re-enabled, flip the flag and restore the presence assertions below.
test('Use cases nav is hidden for now', () => {
  assert.ok(existsSync(HOME), 'run npm run build first');
  const html = readFileSync(HOME, 'utf8');
  assert.ok(!html.includes('uc-nav-trigger'), 'Use cases nav trigger should be hidden for now');
  assert.ok(!html.includes('id="uc-panel"'), 'Use cases dropdown panel should be hidden for now');
});
