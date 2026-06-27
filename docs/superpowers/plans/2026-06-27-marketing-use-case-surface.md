# Marketing use-case surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the data-driven use-case page system (template + registry + the rollouts page), the restrained "Use cases" nav panel, the centralized signup-CTA seam, and the UX-as-DNA canon update, as workstream 1 of the hosted-launch journey.

**Architecture:** Mirror the existing `src/data/competitors.ts` + `/compare/[slug].astro` pattern. Use-case content lives in a typed ESM registry (`src/data/usecases.mjs`) so it is importable by both Astro and `node:test`. One Astro template renders every use-case page from that registry. The nav gains one accessible dropdown panel. A single `src/data/site.mjs` module owns the signup CTA target so a later workstream flips one constant.

**Tech Stack:** Astro 6, TypeScript, plain ESM (`.mjs`) for testable data/logic, `node:test` for unit tests, the "Fluorescence" token/style system already in `src/styles`.

## Global Constraints

- Never use em or en dashes in any copy or code comments. Use commas, periods, or parentheses. (Brand rule, enforced by an automated test in this plan.)
- Brand capitalization: "Mitos" in prose; technical identifiers (`mitos.run`, `mitos-run`, CLI, namespaces) stay lowercase.
- Voice: prove, don't persuade. Headlines are concrete promises (verb + object/number). Imperative CTAs. No slop lexicon (delve, leverage, unlock, seamless, robust, game-changer). One biology word per idea, where true.
- No unverified numbers. Every public number must be reproducible from the engine `bench/`. The only approved numbers are: `~27 ms` warm-claim activate (P50), `~3 MiB` marginal memory per fork, Firecracker `<125 ms` boot. Do NOT use "sub-second boot" as a blanket claim. Do NOT use the "79% use agents / 5% solved sandboxing" stat (refuted).
- Lead every comparison beat with Mitos; never praise a rival. A tie is a tie.
- Run from the `website/` directory. Test command: `npm test` (runs `node --test scripts/lib/*.test.mjs`). Build command: `npm run build`. Dev: `npm run dev`.
- Honor `prefers-reduced-motion` and keyboard accessibility on any interactive nav (mirror the existing mobile menu).

---

### Task 1: UX-as-DNA canon update

Add the enforceable journey principle to the brand canon so every future surface inherits it. Documentation-only; the verification is presence of the principle and that nothing else regressed.

**Files:**
- Modify: `docs/brand/brand-book.md` (append a "Journey" principle near the Voice/Anti-slop section)
- Modify: `.interface-design/system.md` (if present; the enforceable mirror used by `/audit` and `/critique`)
- Modify (mitos repo): `/Users/jannesstubbemann/repos/mitos-run/mitos/CLAUDE.md` (one operating-principle line)

**Interfaces:**
- Consumes: nothing.
- Produces: a documented principle other tasks reference in copy review. No code symbols.

- [ ] **Step 1: Confirm the interface-design system file exists**

Run: `ls -la .interface-design/system.md 2>&1`
Expected: either the file path (modify it in Step 3) or "No such file" (skip it in Step 3, note in commit).

- [ ] **Step 2: Append the Journey principle to the brand book**

In `docs/brand/brand-book.md`, add this block at the end of the Voice/Verbal-identity area (keep the file's existing heading style):

```markdown
## Journey (experience is DNA)

The Apple-for-agents bar: strong brand, dead simple to use, loved end to end.
Three rules every surface inherits:

- The journey has no dead ends. Marketing, onboarding, first success, and
  billing are one designed path; each step carries the user's intent forward.
- Simple surface, depth one click down. Broad coverage never becomes surface
  complexity. One restrained Use-cases panel, not a sprawling mega menu.
- The aha is intent-shaped. One machine, many on-ramps: each use-case page seeds
  context and routes to a tailored first success.

Anti-patterns: mega-menu sprawl, a single generic pricing table, untailored
onboarding, a CTA that dead-ends in docs.
```

- [ ] **Step 3: Mirror the principle into the interface-design system (if it exists)**

If `.interface-design/system.md` exists, add a short "Journey" subsection with the same three rules (one line each) so `/audit` and `/critique` can enforce them. If it does not exist, skip and record that in the commit body.

- [ ] **Step 4: Add the operating-principle line to the mitos CLAUDE.md**

In `/Users/jannesstubbemann/repos/mitos-run/mitos/CLAUDE.md`, under "Operating Principles", add one numbered item matching the existing tone:

```markdown
6. **Experience is DNA.** Every user-facing surface follows the journey rules:
   no dead ends, simple surface with depth one click down, intent-shaped aha.
   See docs/superpowers/specs/2026-06-27-hosted-launch-journey-design.md.
```

- [ ] **Step 5: Verify nothing else changed and the site still builds**

Run: `npm run build`
Expected: build succeeds (the brand-book edit is content under `docs/`, not a route, so the build is unaffected; this confirms no accidental breakage).

- [ ] **Step 6: Commit**

```bash
git add docs/brand/brand-book.md .interface-design/system.md
git commit -m "docs: add journey (experience is DNA) principle to brand canon"
```

(The mitos CLAUDE.md edit is a separate repo; commit it there:)

```bash
cd /Users/jannesstubbemann/repos/mitos-run/mitos && git add CLAUDE.md && git commit -m "docs: add 'experience is DNA' operating principle" && cd -
```

---

### Task 2: Use-case registry and validator

Create the typed ESM registry that powers every use-case page, with the rollouts entry first, and a validator that enforces the brand invariants. This is the data spine the template renders.

**Files:**
- Create: `src/data/usecases.mjs` (registry + `getUseCase` + `validateUseCases`)
- Create: `scripts/lib/usecases.test.mjs` (node:test for the validator and the real data)

**Interfaces:**
- Consumes: `src/data/competitors.ts` indirectly (validator checks `compareSlug` against known competitor slugs, passed in as a set so the test stays pure).
- Produces:
  - `export const useCases: UseCase[]`
  - `export function getUseCase(slug: string): UseCase | undefined`
  - `export function validateUseCases(useCases: UseCase[], knownCompetitorSlugs: Set<string>): string[]` (returns an array of human-readable problems; empty array means valid)
  - `UseCase` shape (JSDoc typedef): `{ slug, group: 'workload'|'integration'|'app', navLabel, navDesc, title, description, h1, lede, problem, mechanism, snippet: { lang, code }, proof: { label, value, source }, compareSlug?, pricing: 'metered'|'box'|'packaged', faqs: {q,a}[] }`

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/usecases.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with a module-not-found error for `../../src/data/usecases.mjs`.

- [ ] **Step 3: Write the registry and validator**

Create `src/data/usecases.mjs`:

```javascript
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
      'Fork one warm environment into thousands of isolated rollouts for reinforcement learning, best-of-N, and tree search. Each fork is its own microVM, warm in ~27 ms.',
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
    if (!u.proof || !u.proof.value) problems.push(`${where}: missing proof`);
    for (const f of u.faqs || []) {
      if (DASH.test(f.q) || DASH.test(f.a)) problems.push(`${where}: faq contains an em or en dash`);
    }
  }
  return problems;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for all six new tests, existing tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/data/usecases.mjs scripts/lib/usecases.test.mjs
git commit -m "feat: use-case registry and brand-invariant validator with rollouts page data"
```

---

### Task 3: Use-case page template

Render every use-case page from the registry, mirroring `/compare/[slug].astro`. Verified by building and asserting the rollouts page output.

**Files:**
- Create: `src/pages/use-cases/[slug].astro`
- Test: `scripts/lib/usecase-page.test.mjs` (asserts on built `dist/` HTML)

**Interfaces:**
- Consumes: `useCases`, `getUseCase` from `src/data/usecases.mjs`; `getCompetitor` from `src/data/competitors.ts`; the `Site` layout from `src/layouts/Site.astro`; `signupUrl` from `src/data/site.mjs` (Task 5; until Task 5 lands, hardcode `/docs/quickstart?uc=<slug>` and replace it in Task 5 Step 4).
- Produces: routes `/use-cases/<slug>` for every registry entry.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/usecase-page.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Integration check: the built rollouts page renders its hero and snippet.
// Run `npm run build` before this test (npm test does not build).
const HTML = 'dist/use-cases/rollouts/index.html';

test('rollouts use-case page builds and renders hero + snippet', () => {
  assert.ok(existsSync(HTML), `expected ${HTML}; run npm run build first`);
  const html = readFileSync(HTML, 'utf8');
  assert.ok(html.includes('Fork one warm environment into thousands of rollouts'), 'h1 missing');
  assert.ok(html.includes('env.fork(64)'), 'snippet missing');
  assert.ok(html.includes('~27 ms'), 'proof number missing');
});
```

- [ ] **Step 2: Run build then test to verify it fails**

Run: `npm run build && npm test`
Expected: FAIL on the new test because `dist/use-cases/rollouts/index.html` does not exist yet.

- [ ] **Step 3: Write the template**

Create `src/pages/use-cases/[slug].astro` (mirror the structure and class conventions of `src/pages/compare/[slug].astro`; reuse existing styles where possible):

```astro
---
// /use-cases/<slug> — intent-shaped landing pages. Data + brand rules live in
// src/data/usecases.mjs. One machine, many on-ramps: each page seeds signup.
import Site from '../../layouts/Site.astro';
import Division from '../../components/Division.astro';
import { useCases, getUseCase } from '../../data/usecases.mjs';
import { getCompetitor } from '../../data/competitors';
import { signupUrl } from '../../data/site.mjs';

export function getStaticPaths() {
  return useCases.map((u) => ({ params: { slug: u.slug } }));
}

const { slug } = Astro.params;
const uc = getUseCase(slug)!;
const cmp = uc.compareSlug ? getCompetitor(uc.compareSlug) : null;
const pricingHref = { metered: '/pricing#payg', box: '/pricing#box', packaged: '/pricing#apps' }[uc.pricing];
const pricingLabel = { metered: 'Pay as you go', box: 'Reserve a box', packaged: 'Buy it as an app' }[uc.pricing];
---

<Site title={uc.title} description={uc.description}>
  <main class="uc">
    <section class="uc-hero">
      <h1>{uc.h1}</h1>
      <p class="lede">{uc.lede}</p>
      <div class="uc-cta">
        <a class="btn btn-primary" href={signupUrl(uc.slug)}>Start free</a>
        <a class="btn btn-ghost" href={uc.proof.source}>See the benchmark</a>
      </div>
    </section>

    <section class="uc-problem">
      <h2>The problem</h2>
      <p>{uc.problem}</p>
    </section>

    <section class="uc-mechanism">
      <Division />
      <h2>How fork solves it</h2>
      <p>{uc.mechanism}</p>
    </section>

    <section class="uc-snippet">
      <pre><code>{uc.snippet.code}</code></pre>
    </section>

    <section class="uc-proof">
      <p class="uc-proof-num">{uc.proof.value}</p>
      <p class="uc-proof-label">{uc.proof.label}. <a href={uc.proof.source}>Reproduce it</a>.</p>
    </section>

    {cmp && (
      <section class="uc-compare">
        <h2>Compared to {cmp.name}</h2>
        <p>{cmp.verdict}</p>
        <a class="btn btn-ghost" href={`/compare/${cmp.slug}`}>Mitos vs {cmp.name}</a>
      </section>
    )}

    <section class="uc-pricing">
      <a class="btn btn-ghost" href={pricingHref}>{pricingLabel}</a>
    </section>

    <section class="uc-faqs">
      {uc.faqs.map((f) => (
        <details>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>

    <section class="uc-end">
      <a class="btn btn-primary" href={signupUrl(uc.slug)}>Start free</a>
    </section>
  </main>
</Site>

<style>
  .uc { max-width: 920px; margin: 0 auto; padding: 64px 24px 96px; }
  .uc section { margin-block: 56px; }
  .uc-hero h1 { font-size: var(--step-5); letter-spacing: -.03em; line-height: 1.04; }
  .uc-hero .lede { color: var(--ink-2); font-size: var(--step-1); max-width: 60ch; margin-top: 16px; }
  .uc-cta { display: flex; gap: 12px; margin-top: 28px; }
  .uc-snippet pre { background: var(--field-1); border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 20px; overflow-x: auto; }
  .uc-proof-num { font-size: var(--step-4); color: var(--magenta); }
  .uc-proof-label { color: var(--ink-2); }
  .uc-faqs details { border-bottom: 1px solid var(--hairline); padding: 16px 0; }
  .uc-faqs summary { cursor: pointer; color: var(--ink); }
  .uc-faqs p { color: var(--ink-2); margin-top: 10px; }
</style>
```

Note: if Task 5 has not run yet, temporarily replace the `signupUrl` import and both `href={signupUrl(uc.slug)}` with `href={\`/docs/quickstart?uc=${uc.slug}\`}`, then restore in Task 5 Step 4.

- [ ] **Step 4: Run build then test to verify it passes**

Run: `npm run build && npm test`
Expected: PASS, including the new `usecase-page` test. The postbuild clean-urls script yields `dist/use-cases/rollouts/index.html`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/use-cases/[slug].astro scripts/lib/usecase-page.test.mjs
git commit -m "feat: data-driven use-case page template with rollouts page"
```

---

### Task 4: Restrained "Use cases" nav panel

Add one accessible dropdown to the header that groups use cases (By workload / By integration / Run an app). No mega-menu sprawl. Mirror the existing mobile-menu accessibility patterns.

**Files:**
- Modify: `src/layouts/Site.astro` (nav markup near line 115, mobile menu near line 132, the nav script near line 169, styles near line 256)

**Interfaces:**
- Consumes: `useCases` from `src/data/usecases.mjs` (group + navLabel + navDesc + slug).
- Produces: a desktop dropdown panel and a mobile section listing use cases by group.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/nav-usecases.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run build then test to verify it fails**

Run: `npm run build && npm test`
Expected: FAIL on `nav-usecases` (no Use-cases trigger in the built header yet).

- [ ] **Step 3: Add the panel data and markup to Site.astro**

In `src/layouts/Site.astro` frontmatter, after the `navLinks` array (line 63), add:

```javascript
import { useCases } from '../data/usecases.mjs';
const ucGroups = [
  { key: 'workload', label: 'By workload' },
  { key: 'integration', label: 'By integration' },
  { key: 'app', label: 'Run an app' },
].map((g) => ({ ...g, items: useCases.filter((u) => u.group === g.key) }))
  .filter((g) => g.items.length > 0);
```

Replace the desktop `<nav class="nav-links">` block (line 115) so the first item is the dropdown trigger followed by the existing links:

```astro
<nav class="nav-links">
  <div class="uc-nav">
    <button class="uc-nav-trigger" id="uc-trigger" type="button" aria-expanded="false" aria-controls="uc-panel">Use cases</button>
    <div class="uc-panel" id="uc-panel" inert>
      {ucGroups.map((g) => (
        <div class="uc-col">
          <p class="uc-col-h">{g.label}</p>
          {g.items.map((u) => (
            <a href={`/use-cases/${u.slug}`}><span>{u.navLabel}</span><small>{u.navDesc}</small></a>
          ))}
        </div>
      ))}
    </div>
  </div>
  {navLinks.map((l) => <a href={l.href}>{l.label}</a>)}
</nav>
```

In the mobile menu (`<nav class="nav-menu-links">`, line 134), append a use-cases section after the existing links:

```astro
{ucGroups.map((g) => (
  <>
    <p class="nav-menu-group">{g.label}</p>
    {g.items.map((u) => <a href={`/use-cases/${u.slug}`}>{u.navLabel}</a>)}
  </>
))}
```

- [ ] **Step 4: Add the dropdown behavior to the nav script**

In the `<script>` near line 169 (the mobile-menu handler), add a sibling block. Mirror the existing escape/aria patterns:

```javascript
const ucTrigger = document.getElementById('uc-trigger');
const ucPanel = document.getElementById('uc-panel');
if (ucTrigger && ucPanel) {
  const setUc = (open) => {
    ucTrigger.setAttribute('aria-expanded', String(open));
    if (open) ucPanel.removeAttribute('inert'); else ucPanel.setAttribute('inert', '');
    ucPanel.classList.toggle('open', open);
  };
  ucTrigger.addEventListener('click', () => setUc(ucTrigger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setUc(false); });
  document.addEventListener('click', (e) => {
    if (!ucPanel.contains(e.target) && e.target !== ucTrigger) setUc(false);
  });
}
```

- [ ] **Step 5: Add styles**

Near the nav styles (line 256), add. Keep it instrument-grade: one panel, hairline border, no second accent, transform/opacity only:

```css
.uc-nav { position: relative; }
.uc-nav-trigger { background: none; border: 0; color: var(--ink-2); font: inherit; font-size: var(--text-dense); cursor: pointer; }
.uc-nav-trigger:hover, .uc-nav-trigger[aria-expanded="true"] { color: var(--ink); }
.uc-panel { position: absolute; top: calc(100% + 14px); left: 0; display: none; gap: 28px; padding: 20px 22px; background: var(--field-1); border: 1px solid var(--hairline); border-radius: var(--r-md); }
.uc-panel.open { display: flex; }
.uc-col { min-width: 180px; }
.uc-col-h { color: var(--ink-3); font-size: var(--text-dense); margin-bottom: 10px; }
.uc-col a { display: block; padding: 7px 0; }
.uc-col a span { display: block; color: var(--ink); }
.uc-col a small { display: block; color: var(--ink-2); }
.uc-col a:hover span { color: var(--magenta); }
.nav-menu-group { color: var(--ink-3); margin-top: 22px; }
@media (prefers-reduced-motion: reduce) { .uc-panel { transition: none; } }
```

- [ ] **Step 6: Run build then test to verify it passes**

Run: `npm run build && npm test`
Expected: PASS, including `nav-usecases`. Existing tests still green.

- [ ] **Step 7: Manual accessibility check**

Run: `npm run dev`, open the site, confirm: the Use-cases trigger toggles the panel, Escape closes it, clicking outside closes it, the panel links navigate, and on mobile the use-cases section appears in the hamburger overlay.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/Site.astro scripts/lib/nav-usecases.test.mjs
git commit -m "feat: restrained Use-cases nav panel (desktop dropdown + mobile section)"
```

---

### Task 5: Signup CTA seam

Centralize the signup CTA target so a later workstream flips one constant, and seed the use-case template id into the URL. Keep the current destination (`/docs/quickstart`) until the hosted signup ships.

**Files:**
- Create: `src/data/site.mjs` (`SIGNUP_BASE`, `signupUrl`)
- Test: `scripts/lib/site.test.mjs`
- Modify: `src/layouts/Site.astro` (replace the local `SIGNUP` constant at line 61 with the shared one)
- Modify: `src/pages/use-cases/[slug].astro` (use `signupUrl` if it was stubbed in Task 3)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export const SIGNUP_BASE: string` (currently `/docs/quickstart`)
  - `export function signupUrl(useCaseSlug?: string): string` returning `SIGNUP_BASE` plus `?uc=<slug>` when a slug is given.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/site.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SIGNUP_BASE, signupUrl } from '../../src/data/site.mjs';

test('signupUrl without a use case is the base', () => {
  assert.equal(signupUrl(), SIGNUP_BASE);
});

test('signupUrl seeds the use-case slug', () => {
  assert.equal(signupUrl('rollouts'), `${SIGNUP_BASE}?uc=rollouts`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with module-not-found for `../../src/data/site.mjs`.

- [ ] **Step 3: Write the module**

Create `src/data/site.mjs`:

```javascript
// Single source for the signup CTA target. The hosted self-serve signup is a
// later workstream; until it ships, the CTA lands on the quickstart. Flip
// SIGNUP_BASE to '/signup' when the hosted funnel goes live; every CTA follows.
export const SIGNUP_BASE = '/docs/quickstart';

/** @param {string} [useCaseSlug] */
export function signupUrl(useCaseSlug) {
  return useCaseSlug ? `${SIGNUP_BASE}?uc=${useCaseSlug}` : SIGNUP_BASE;
}
```

- [ ] **Step 4: Run test to verify it passes, then wire it into Site.astro and the template**

Run: `npm test`
Expected: PASS.

Then in `src/layouts/Site.astro`, replace line 61 (`const SIGNUP = '/docs/quickstart'; // TODO...`) with:

```javascript
import { SIGNUP_BASE as SIGNUP } from '../data/site.mjs';
```

And in `src/pages/use-cases/[slug].astro`, ensure the import `import { signupUrl } from '../../data/site.mjs';` is present and both CTAs use `signupUrl(uc.slug)` (restore if stubbed in Task 3).

- [ ] **Step 5: Run build and full test suite**

Run: `npm run build && npm test`
Expected: build succeeds; all tests pass; the rollouts page CTAs point to `/docs/quickstart?uc=rollouts`.

- [ ] **Step 6: Commit**

```bash
git add src/data/site.mjs scripts/lib/site.test.mjs src/layouts/Site.astro src/pages/use-cases/[slug].astro
git commit -m "feat: centralize signup CTA seam and seed use-case context"
```

---

## Self-Review

**1. Spec coverage (workstream 1 scope from the journey spec):**
- Nav: restrained Use-cases panel (By workload / By integration / Run an app) -> Task 4. Covered.
- Use-case page template, data-driven like competitors.ts -> Tasks 2, 3. Covered.
- Rollouts page (priority build, uncontested intent) -> Tasks 2, 3. Covered.
- Signup CTA pre-seeded with use-case template id -> Task 5. Covered.
- Messaging discipline (no dashes, approved numbers only, no refuted stat) -> Global Constraints + the validator in Task 2 enforces the dash rule automatically. Covered.
- UX-as-DNA canon update (brand book, interface system, CLAUDE.md) -> Task 1. Covered.
- Out of scope for this plan (deliberate, become follow-on plans): the code-execution and evals use-case entries (additional `useCases` array items once the template exists), the `/integrations` page (workstream 5 supplies the runtime), SEO/AEO structured data hardening, and the pricing-page IA rework (workstream 4). Noted so the gap is explicit, not silent.

**2. Placeholder scan:** No "TBD"/"handle errors"/"similar to" placeholders. Every code step shows complete code. The one conditional ("if Task 5 has not run yet, stub the import") gives the exact stub and the exact restore, so an out-of-order reader is covered.

**3. Type consistency:** `useCases`, `getUseCase`, `validateUseCases`, `signupUrl`, `SIGNUP_BASE` are used with the same signatures across Tasks 2, 3, 4, 5. The `UseCase` fields referenced in the template (Task 3) and the nav (Task 4: `group`, `navLabel`, `navDesc`, `slug`) all exist in the typedef defined in Task 2. The validator enum values (`workload|integration|app`, `metered|box|packaged`) match the typedef and the template's `pricingHref`/`pricingLabel` maps.

Note for the executor: `npm test` does not build; the two integration tests (`usecase-page`, `nav-usecases`) require `npm run build` first. The steps that run them always pair `npm run build && npm test`. A follow-up could fold a build step into a `pretest` script, but that is out of scope here.
