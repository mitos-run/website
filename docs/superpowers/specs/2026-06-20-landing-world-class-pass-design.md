# mitos landing page — world-class pass (design spec)

Date: 2026-06-20
Status: approved (design), implementing

## Goal / the one job

Make **agent swarms / live microVM forking click instantly**. A developer must *get*
the concept — "fork one running sandbox into N isolated subagents in milliseconds" —
within seconds, and feel that mitos is crafted to Jobs/Ive standards. Selling the
**hosted/managed** product; open source is a minimal trust badge only.

## Locked decisions (from brainstorming)

- **Design language:** Vercel-style — pure black, Geist Sans + Geist Mono, white CTAs,
  hairline borders, near-zero color.
- **Hero:** code-forward (Daytona/Blaxel pattern). Install pill + tabbed, copy-to-paste
  code example whose `fork(8)` line is the aha.
- **Headline:** "Spin up agent swarms in milliseconds."
  Sub: "Fork one running microVM into hundreds of isolated subagents — each its own
  computer. Fully managed."
- **Through-line:** agent swarms / subagents, used truthfully (= N-way live fork into
  independent sandboxes; no vague hype).
- **Reduction:** aggressive — cut to essentials; merge the rest.
- **Motion:** tasteful & restrained — scroll-reveal fades + ONE signature swarm fan-out
  (scroll-triggered, once) + smooth working tabs/copy. All gated by
  `prefers-reduced-motion`.
- **Copy guardrail:** precise about the core feature/benefit; NO meta
  "honest by construction / verify the benchmarks" framing on the landing page.

## Section structure (final, aggressive)

1. **Nav** — minimal; hairline border appears on scroll; working anchor scroll w/ offset.
2. **Hero** — eyebrow ("microVM sandboxes for agent swarms"), headline B, one-line sub,
   dual CTA (Start building / Read the docs), spec line (`~27ms per fork · ~3 MiB per
   subagent · scales to N`). Right: install pill (`pip install mitos` + copy) over a code
   card with **working** tabs (Python / TypeScript / CLI) and a **working** copy button
   ("Copied" feedback). A small "+ MCP server" line nods to surfaces (merged-in).
3. **Swarm section** ⭐ — "One agent. A swarm of subagents." Signature scroll-triggered
   fan-out (`vm·0 → ·1 … ·N`). Economics line: CoW means each subagent costs only the
   pages it dirties (~3 MiB), not a whole VM. Inline proof stats (folds the old metric
   band in). Compact merged use-case line: "Built for parallel attempts · RL rollouts /
   test-time scaling · multi-agent eval."
4. **Why hosted** — the product sell ("fully managed"): no nodes to manage · warm pools
   maintained · scale on demand · production-parity engine. CTA.
5. **How it works** — 3 calls: claim a warm sandbox → fork into a swarm → keep the winner.
   Code per step.
6. **Comparison** — "The one quadrant where mitos is alone" table (fork running state ·
   warm ms claims · durable forkable workspaces · isolation · open source). Disclaimer:
   competitor cells from public docs, not a head-to-head benchmark.
7. **Final CTA** — "Give your agents a swarm of computers." Dual CTA.
8. **Footer** — refined; OSS trust badge folded in (Apache 2.0 · GitHub).

## Craft requirements (the Jobs/Ive layer)

- **Interactions:** code tabs switch real panels; copy buttons write to clipboard and show
  transient "Copied". Keyboard-operable; `:focus-visible` rings.
- **Motion:** IntersectionObserver scroll-reveal (opacity/translateY, staggered); swarm
  fan-out plays once on enter; reduced-motion disables all.
- **Type & space:** deliberate Geist scale, tight display tracking, controlled measure,
  8px rhythm, whitespace as material.
- **Polish:** custom `::selection`, consistent radii/hairlines, no layout shift, graceful
  mobile stacking (hero → single column, code card scrolls, tap targets ≥40px).
- **A11y/SEO:** semantic landmarks, alt/aria where needed, meta description, OG tags
  (OG image = follow-up).

## Honesty constraints (numbers must stay true to the engine)

- `~27 ms` = warm-claim activate P50 (bare-metal reference node).
- `~3 MiB` = marginal memory per fork via CoW page sharing.
- "swarm" = N-way live CoW fork into independent Ready sandboxes (real engine capability).
- No fabricated customer logos or GitHub star counts.

## Out of scope (follow-ups)

- Pricing, Benchmarks, Blog, Solutions pages.
- Hosted console signup URL (CTAs point to /quickstart/ for now).
- OG image asset; live GitHub star count fetch.
