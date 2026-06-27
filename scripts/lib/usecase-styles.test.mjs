import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SRC = readFileSync(new URL('../../src/pages/use-cases/[slug].astro', import.meta.url), 'utf8');

test('use-case template uses only defined type-scale tokens', () => {
  assert.ok(!SRC.includes('--step-'), 'undefined --step-* token present');
  assert.ok(SRC.includes('var(--text-display)'), 'expected --text-display');
  assert.ok(SRC.includes('var(--text-lede)'), 'expected --text-lede');
});
