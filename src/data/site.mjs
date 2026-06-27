// Single source for the signup CTA target. The hosted self-serve signup is a
// later workstream; until it ships, the CTA lands on the quickstart. Flip
// SIGNUP_BASE to '/signup' when the hosted funnel goes live; every CTA follows.
export const SIGNUP_BASE = '/docs/quickstart';

/** @param {string} [useCaseSlug] */
export function signupUrl(useCaseSlug) {
  return useCaseSlug ? `${SIGNUP_BASE}?uc=${useCaseSlug}` : SIGNUP_BASE;
}
