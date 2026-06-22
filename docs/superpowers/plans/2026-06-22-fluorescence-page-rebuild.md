# Fluorescence Page Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild the landing page (`index.astro`) on the Fluorescence system + the research-driven Pareto-optimal information architecture, with honest, anti-slop, conversion-focused copy.

**Architecture:** Convert `index.astro` from a standalone light/emerald page to one that uses the `Site` layout (inheriting tokens, nav, footer, components). Port real content (code surfaces, comparison data, numbers), restyle dark + magenta, reorder/add sections per the new IA, build the OG image, run a11y checks, delete the preview page.

**Tech Stack:** Astro 6.4.8, Fluorescence tokens (plan 1), components + Division (plan 2), headless Chrome for screenshots.

## Plan sequence (3 of 3)
1. ✅ Token foundation. 2. ✅ The system. 3. **The page** (this plan).

## Global Constraints (positioning + honesty — from competitive research, 2026-06-22)

- **Position at "Act 3":** sell the FORK / swarm primitive, not "a secure sandbox." Reframe onto swarms, RL rollouts, best-of-N, tree search.
- **The honest moat = the combination:** fastest/densest **live** CoW fork of *running* memory (~27ms, ~3 MiB) + honest CoW economics + real **Apache-2.0** exit, **managed**. Do NOT claim live-fork is unique/industry-first (Morph, Daytona, CodeSandbox, OSS `forkd` also fork).
- **Managed is the product; OSS is the trust/no-lock-in signal** — never "self-host is our offering." OSS = "your insurance, not your homework."
- **Honesty (confirmed):** hosted console NOT live → CTA = run the OSS engine today / early access, no fake hosted signup. **Hard spend caps ARE real** → may claim. **No** suspend-to-zero, **no** SOC2 → omit both.
- **Numbers stay true to the engine:** ~27ms warm-fork P50, ~3 MiB CoW marginal. No fabricated logos, testimonials, or star counts (fetch real stars; fall back to "open source" if low/unavailable).
- **Voice/anti-slop:** never em/en dashes; no slop lexicon; prove-don't-persuade; imperative CTAs; mechanism = benefit; vary sentence length. Blaxel markets "25ms" resume — keep the fork-into-N vs resume-to-self distinction sharp.
- **Style:** Fluorescence only — magenta-dominant on `#04050A`, additive white-cored glow, tokens via `var(--*)`, no inline hex.

## Information architecture (final)

1. Hero — fork primitive + numbers + live-state; "we run it, Apache-2.0 so you're never trapped"; tabbed code card (keep `fork(8)` aha).
2. Trust strip — Apache 2.0 · ★stars (real, graceful) · ~27ms/fork · ~3 MiB/daughter · microVM isolated.
3. The Division — "others cold-boot or snapshot-restore; mitos forks the live machine"; the 8-way fan-out viz (Fluorescence-restyled) + stats.
4. Use cases — best-of-N · RL rollouts/fan-out · tree search (MCTS) · multi-agent evals · untrusted code.
5. How it works — 3 calls (warm sandbox → fork → keep the winner).
6. Managed + OSS — "we run the cluster, you call the API"; OSS = no-lock-in insurance.
7. Comparison — capability matrix vs E2B/Modal/Daytona/Morph; honest, microVM + Apache-2.0 + live-fork wins.
8. Security & isolation — microVM/KVM per subagent = the answer to prompt-injection→RCE (stated once).
9. Economics — CoW "pay for divergence, not duplication" + hard spend caps; link to /pricing.
10. FAQ — production-ready? concurrency? self-host? isolation? bill? SDKs?
11. Final CTA + footer (footer from Site).

---

### Task 1: Convert to Site layout + hero + trust strip
**Files:** Modify `src/pages/index.astro` (full rewrite, phase 1: frontmatter + Site wrapper + hero + trust strip).
- [ ] Replace the standalone `<html>` shell with `<Site title description>`; move `surfaces`, `steps`, `hostedItems`, `compCols/compRows`, `daughters` data into frontmatter; add a build-time star fetch with try/catch + threshold fallback.
- [ ] Hero: H1 "One agent divides into a thousand."; subhead carrying the fork primitive + ~27ms/~3 MiB + live-state + "we run the metal, Apache 2.0 so you're never locked in"; primary CTA "Start building" (→ quickstart/OSS run-now), secondary "See the benchmark"; spec line; tabbed code card (port the tabs/copy script — note `Site` already has copy-to-clipboard; keep the tab-switch script local).
- [ ] Trust strip: Apache 2.0 · ★stars (only if real & >= threshold) · ~27ms/fork · ~3 MiB/daughter · microVM isolated.
- [ ] Restyle hero + card to Fluorescence (field-1 card, hairline, magenta tab indicator, Geist Mono).
- [ ] Build + screenshot hero; visual gate; commit.

### Task 2: The Division section + Use cases
**Files:** Modify `index.astro`.
- [ ] Division section: new H2 "Most sandboxes cold-boot or restore a snapshot. mitos forks the running machine."; lede (live VM, CoW pages, parent keeps running, ~3 MiB each, keep the winner); the 8-way fan-out SVG restyled to Fluorescence (magenta parent core/accent, cyan daughters, glowing paths, additive); run button; stats 27ms/3MiB/N-way.
- [ ] Use cases section: H2 "Built for the work that needs many of them"; 5 items (best-of-N, RL rollouts/fan-out, tree search/MCTS, multi-agent evals, untrusted code), each one concrete line.
- [ ] Build + screenshot; commit.

### Task 3: How it works + Managed/OSS
**Files:** Modify `index.astro`.
- [ ] How it works: 3 steps (warm sandbox → fork → keep what worked), Fluorescence code blocks.
- [ ] Managed+OSS: H2 "We run the cluster. You call the API."; lede reframing OSS as no-lock-in insurance (not the product); the 4 hosted items reworded; CTA.
- [ ] Build + screenshot; commit.

### Task 4: Comparison + Security + Economics
**Files:** Modify `index.astro`.
- [ ] Comparison: honest capability matrix. Rows: live fork of a RUNNING VM (memory+processes) · published marginal cost/daughter · microVM (hardware) isolation · open-source license · managed cloud. Cells honest: E2B (fork n, Apache y, microVM y), Modal (fork n, gVisor, closed), Daytona (fork partial/filesystem, AGPL, gVisor), Morph (fork partial/snapshot, closed, undisclosed). Only mitos = yes across live-fork + microVM + Apache + managed. Magenta marks mitos wins. Note "from public docs, not a benchmark."
- [ ] Security: H2 "Every fork is a real microVM, not a shared kernel."; microVM/KVM isolation = answer to prompt-injection→RCE.
- [ ] Economics: H2 "Copy-on-write means you pay for divergence, not duplication."; CoW + hard spend caps (no surprise five-figure bill); link to /pricing. (No suspend-to-zero claim.)
- [ ] Build + screenshot; commit.

### Task 5: FAQ + final CTA + copy/anti-slop sweep
**Files:** Modify `index.astro`.
- [ ] FAQ (details/summary): production-ready? · how many forks at once? · can I run it myself? · how are subagents isolated? · will I get a surprise bill? · which languages/SDKs?
- [ ] Final CTA: "Give your agents a swarm of computers." + Start building / Read the docs.
- [ ] Anti-slop sweep: grep for em/en dashes and slop lexicon across the page; fix. Verify CTAs imperative.
- [ ] Build + screenshot full page; commit.

### Task 6: OG image + a11y + cleanup
**Files:** Create `src/pages/og-template.astro` (1200x630), generate `public/og.png` via Chrome screenshot; delete `src/pages/tokens-preview.astro`; update `Site.astro` og:image:alt.
- [ ] Build the OG template (colony field + magenta + wordmark + tagline + key numbers), screenshot at 1200x630 → `public/og.png`.
- [ ] Delete `tokens-preview.astro`; remove its route.
- [ ] a11y: contrast already verified (plan 1); check focus states, reduced-motion on the page, headings order.
- [ ] Full build + final full-page screenshot; commit.

## Self-Review
Covers IA sections 1–11 across Tasks 1–6; honesty constraints encoded in Global Constraints + per-task copy; OG + cleanup in Task 6. Pricing page (`pricing.astro`) and benchmarks already inherit tokens via `Site` (restyled in plan 1 wiring) — a follow-up pass on their page-specific styles is noted as out-of-scope here. Star-count fetch fails safe. No fabricated proof.
