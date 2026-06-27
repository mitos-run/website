import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useCases, getUseCase, validateUseCases } from '../../src/data/usecases.mjs';

const KNOWN = new Set(['e2b', 'modal', 'daytona', 'morph', 'codesandbox']);

test('the real registry passes validation', () => {
  assert.deepEqual(validateUseCases(useCases, KNOWN), []);
});

test('rollouts use case exists and is a workload', () => {
  const uc = getUseCase('rollouts');
  assert.ok(uc, 'rollouts should exist');
  assert.equal(uc.group, 'workload');
  assert.equal(uc.pricing, 'metered');
});

test('validator flags an em dash in copy', () => {
  const bad = [{ ...useCases[0], slug: 'x', lede: 'fast — isolated' }];
  const problems = validateUseCases(bad, KNOWN);
  assert.ok(problems.some((p) => p.includes('dash')), problems.join('; '));
});

test('validator flags a duplicate slug', () => {
  const dup = [useCases[0], { ...useCases[0] }];
  const problems = validateUseCases(dup, KNOWN);
  assert.ok(problems.some((p) => p.includes('duplicate')), problems.join('; '));
});

test('validator flags an unknown compareSlug', () => {
  const bad = [{ ...useCases[0], slug: 'y', compareSlug: 'nope' }];
  const problems = validateUseCases(bad, KNOWN);
  assert.ok(problems.some((p) => p.includes('compareSlug')), problems.join('; '));
});

test('validator flags an unknown pricing shape', () => {
  const bad = [{ ...useCases[0], slug: 'z', pricing: 'free' }];
  const problems = validateUseCases(bad, KNOWN);
  assert.ok(problems.some((p) => p.includes('pricing')), problems.join('; '));
});
