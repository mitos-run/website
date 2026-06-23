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
