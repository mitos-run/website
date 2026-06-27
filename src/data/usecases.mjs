// Use-case pages: data-driven, mirrors src/data/competitors.ts. Powers
// /use-cases/<slug>. Positioning and brand rules (see docs/brand/brand-book.md):
//  - Prove, don't persuade. Headlines are concrete promises. Imperative CTAs.
//  - Lead with the plain outcome; insider terms (best-of-N, RL rollouts) are
//    examples, not the headline.
//  - No unverified numbers: only ~27 ms activate, ~3 MiB / fork, Firecracker
//    <125 ms boot, each reproducible from the engine bench/.
//  - Never use em or en dashes. One biology word per idea, where true.

/**
 * @typedef {Object} UseCase
 * @property {string} slug
 * @property {'workload'|'integration'|'app'} group
 * @property {string} navLabel  short label for the nav panel
 * @property {string} navDesc   one-line descriptor in the nav panel
 * @property {string} title     <title>, keep under ~65 chars
 * @property {string} description meta description, ~150-160 chars
 * @property {string} h1
 * @property {string} lede
 * @property {string} problem   the pain in the user's own words
 * @property {string} mechanism how fork solves it
 * @property {{lang:string, code:string}} snippet copy-paste preview of the aha
 * @property {{label:string, value:string, source:string}} proof reproducible number
 * @property {string} [compareSlug] links to /compare/<slug>
 * @property {'metered'|'box'|'packaged'} pricing
 * @property {{q:string, a:string}[]} faqs
 */

/** @type {UseCase[]} */
export const useCases = [
  {
    slug: 'rollouts',
    group: 'workload',
    navLabel: 'RL rollouts',
    navDesc: 'Fork one warm env into thousands of parallel runs.',
    title: 'Mitos for RL rollouts and parallel agent runs',
    description:
      'Fork one warm environment into thousands of isolated rollouts for reinforcement learning, best-of-N, and tree search. Each is its own microVM, warm in ~27 ms.',
    h1: 'Fork one warm environment into thousands of rollouts',
    lede:
      'Run reinforcement learning, best-of-N, and tree search by forking one warm environment into many isolated runs at once. Each run is its own microVM, alive in ~27 ms, and you pay only for what it changes.',
    problem:
      'Rollout generation is the bottleneck. Cold-booting a fresh environment per run wastes minutes of init, and coupling state to one filesystem makes checkpoint and rollback the slow part of every trajectory.',
    mechanism:
      'Mitos forks a running environment. Daughters share the parent pages copy-on-write, so each rollout starts from a warm, identical state in fork latency, not a cold boot, and diverges only where it writes.',
    snippet: {
      lang: 'py',
      code: `from mitos import AgentRun

env = AgentRun().sandbox("python", ready=True)

# fork one warm env into 64 isolated rollouts
rollouts = env.fork(64)
for r in rollouts:
    r.run_code("import policy; policy.step()")`,
    },
    proof: {
      label: 'Warm-claim activate (P50)',
      value: '~27 ms',
      source: '/benchmarks',
    },
    compareSlug: 'modal',
    pricing: 'metered',
    faqs: [
      {
        q: 'How many rollouts can I run at once?',
        a: 'Forks are independent microVMs that share the parent memory copy-on-write, so a fleet of warm rollouts costs about its dirtied pages, not N full VMs. Concurrency scales with your pool and plan.',
      },
      {
        q: 'Is each rollout isolated?',
        a: 'Yes. Every fork is a real Firecracker microVM with its own kernel, not a shared-kernel container, so one rollout cannot observe or affect another.',
      },
      {
        q: 'How do I checkpoint and roll back?',
        a: 'A fork is the checkpoint. Fork a running environment to branch it, keep the run that worked, and drop the rest. No snapshot-to-disk round trip on the hot path.',
      },
    ],
  },
];

/** @param {string} slug */
export function getUseCase(slug) {
  return useCases.find((u) => u.slug === slug);
}

const GROUPS = new Set(['workload', 'integration', 'app']);
const PRICING = new Set(['metered', 'box', 'packaged']);
const DASH = /[–—]/; // en dash, em dash

/**
 * @param {UseCase[]} list
 * @param {Set<string>} knownCompetitorSlugs
 * @returns {string[]} problems; empty means valid
 */
export function validateUseCases(list, knownCompetitorSlugs) {
  const problems = [];
  const seen = new Set();
  for (const u of list) {
    const where = u.slug || '(missing slug)';
    if (!u.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(u.slug)) {
      problems.push(`${where}: slug must be kebab-case`);
    }
    if (seen.has(u.slug)) problems.push(`${where}: duplicate slug`);
    seen.add(u.slug);
    if (!GROUPS.has(u.group)) problems.push(`${where}: unknown group ${u.group}`);
    if (!PRICING.has(u.pricing)) problems.push(`${where}: unknown pricing ${u.pricing}`);
    if (u.compareSlug && !knownCompetitorSlugs.has(u.compareSlug)) {
      problems.push(`${where}: unknown compareSlug ${u.compareSlug}`);
    }
    for (const field of ['navLabel', 'navDesc', 'title', 'description', 'h1', 'lede', 'problem', 'mechanism']) {
      if (!u[field]) problems.push(`${where}: missing ${field}`);
      else if (DASH.test(u[field])) problems.push(`${where}: ${field} contains an em or en dash`);
    }
    if (u.title && u.title.length > 65) problems.push(`${where}: title over 65 chars`);
    if (!u.snippet || !u.snippet.code) problems.push(`${where}: missing snippet`);
    else if (DASH.test(u.snippet.code)) problems.push(`${where}: snippet contains an em or en dash`);
    if (!u.faqs || u.faqs.length === 0) problems.push(`${where}: missing faqs`);
    if (!u.proof || !u.proof.value || !u.proof.label || !u.proof.source) problems.push(`${where}: missing proof`);
    for (const f of u.faqs || []) {
      if (DASH.test(f.q) || DASH.test(f.a)) problems.push(`${where}: faq contains an em or en dash`);
    }
  }
  return problems;
}
