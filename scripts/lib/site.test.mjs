import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SIGNUP_BASE, signupUrl } from '../../src/data/site.mjs';

test('signupUrl without a use case is the base', () => {
  assert.equal(signupUrl(), SIGNUP_BASE);
});

test('signupUrl seeds the use-case slug', () => {
  assert.equal(signupUrl('rollouts'), `${SIGNUP_BASE}?uc=rollouts`);
});
