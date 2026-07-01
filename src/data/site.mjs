// Single source for the signup CTA target. The hosted self-serve signup is live
// behind an allowlist gate: the console is served single-origin at mitos.run and
// the front-door forwards /signup to it. Every CTA reads this constant, and
// signupUrl(slug) appends the ?uc on-ramp seed carried through to first-run.
export const SIGNUP_BASE = '/signup';

/** @param {string} [useCaseSlug] */
export function signupUrl(useCaseSlug) {
  return useCaseSlug ? `${SIGNUP_BASE}?uc=${useCaseSlug}` : SIGNUP_BASE;
}
