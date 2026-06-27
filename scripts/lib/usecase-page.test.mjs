import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Integration check: the built rollouts page renders its hero and snippet.
// Run `npm run build` before this test (npm test does not build).
const HTML = 'dist/use-cases/rollouts.html';

test('rollouts use-case page builds and renders hero + snippet', () => {
  assert.ok(existsSync(HTML), `expected ${HTML}; run npm run build first`);
  const html = readFileSync(HTML, 'utf8');
  assert.ok(html.includes('Fork one warm environment into thousands of rollouts'), 'h1 missing');
  assert.ok(html.includes('env.fork(64)'), 'snippet missing');
  assert.ok(html.includes('~27 ms'), 'proof number missing');
});
