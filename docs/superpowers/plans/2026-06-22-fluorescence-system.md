# Fluorescence System (Division + Components + Brand Book) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the visual system on top of the token foundation — the signature "Division" animation, the core reusable components (magenta buttons, nav, code/terminal block, comparison table) — then codify the whole brand into an enforceable brand book + design-system file.

**Architecture:** New `Division.astro` component renders the fork-as-mitosis signature using SVG + CSS (crisp, reduced-motion-trivial, additive feel via `mix-blend-mode: screen`). Component styles are added to the shared `<style is:global>` in `Site.astro`, replacing the old monochrome button/nav/code rules with magenta-dominant Fluorescence versions. Documentation (`docs/brand/brand-book.md`, `.interface-design/system.md`) captures the decisions so they are enforceable. Verified live on `tokens-preview.astro` with headless screenshots.

**Tech Stack:** Astro 6.4.8, plain CSS custom properties (tokens from plan 1), SVG + CSS keyframes, headless Chrome for screenshot verification.

## Plan sequence (this is plan 2 of 3)
1. ✅ Token foundation — tokens.css, fonts, base.css, field/grain/reticle.
2. **The system** (this plan) — Division animation, components, brand-book.md, system.md.
3. The page — rebuild `index.astro` on tokens + components, copy pass, OG, a11y/audit, delete preview page.

## Global Constraints

From `docs/superpowers/specs/2026-06-22-fluorescence-brand-book-design.md` (already materialized as tokens in plan 1 — reference via `var(--*)`, never raw hex):
- **Magenta-dominant:** `--magenta #FF45C8` = brand signature (logo/nav/primary CTA); `--cyan #3DDCFF` = steady "alive"/genome; `--green`/`--amber` rationed.
- **Glow = additive + white-cored + layered**, never a flat neon ring; never animate `box-shadow` blur — animate `transform`/`opacity`.
- **< 10% of any frame lit at full intensity.** Color encodes a real entity only.
- **Motion:** transform/opacity only, `<500ms` for UI (the Division may run ~600–800ms as the one orchestrated moment), `var(--ease)`, `prefers-reduced-motion` honored (Division → static final split).
- **Type:** Satoshi display at light weights; Geist Mono for code/telemetry with tabular figures.
- **Copy:** never em/en dashes; no slop lexicon; imperative CTAs ("Fork a sandbox", "Read the spec"), never "Get started/Learn more".
- **A11y:** visible keyboard focus (magenta ring, in base.css); the Division has a text alternative.

---

### Task 1: The Division — signature animation component

**Files:**
- Create: `src/components/Division.astro`
- Modify: `src/pages/tokens-preview.astro` (mount it for visual verification)

**Interfaces:**
- Produces: `<Division size?={number} trigger?={boolean} />` — a self-contained luminous cell-division animation. `size` sets the px width (default 240). `trigger` (default true) shows the "Run fork(8)" button that replays it. Consumed by the hero in plan 3.

- [ ] **Step 1: Create `src/components/Division.astro`**

```astro
---
// The Division — fork() rendered as mitosis, the brand's signature element.
// One luminous cell (white-hot core, cyan genome halo) divides; a magenta
// spindle pulls it apart; a white-hot flash at separation (cyan+magenta ->
// white); two daughters drift apart, each able to divide again.
// SVG + CSS so it is crisp, cheap, and reduced-motion-trivial.
interface Props { size?: number; trigger?: boolean; }
const { size = 240, trigger = true } = Astro.props;
---
<div class="division" style={`--dz:${size}px`}>
  <svg class="division-svg" viewBox="0 0 240 150" role="img"
       aria-label="A single cell divides into two daughter cells: the mitos live fork.">
    <defs>
      <radialGradient id="genome" cx="50%" cy="48%" r="55%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="42%" stop-color="#bfeeff"/>
        <stop offset="100%" stop-color="#3DDCFF" stop-opacity="0"/>
      </radialGradient>
      <filter id="bloom" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g class="stage">
      <line class="spindle" x1="92" y1="75" x2="148" y2="75"/>
      <circle class="cell parent" cx="120" cy="75" r="34" fill="url(#genome)" filter="url(#bloom)"/>
      <circle class="cell d-l" cx="120" cy="75" r="26" fill="url(#genome)" filter="url(#bloom)"/>
      <circle class="cell d-r" cx="120" cy="75" r="26" fill="url(#genome)" filter="url(#bloom)"/>
      <circle class="flash" cx="120" cy="75" r="10" fill="#fff"/>
    </g>
  </svg>
  {trigger && <button class="division-trigger mono" type="button">Run fork(8)</button>}
</div>

<style>
  .division { width: var(--dz); max-width: 100%; }
  .division-svg { width: 100%; height: auto; display: block; overflow: visible; mix-blend-mode: screen; }
  .stage { transform-origin: 120px 75px; }

  .spindle { stroke: var(--magenta); stroke-width: 2; opacity: 0; filter: drop-shadow(0 0 4px var(--magenta)); }
  .flash { opacity: 0; }
  .d-l, .d-r { opacity: 0; }

  /* Replay by toggling .run on the wrapper (set on load + on click). */
  .division.run .parent  { animation: parent-divide 1100ms var(--ease) both; }
  .division.run .spindle { animation: spindle 1100ms var(--ease) both; }
  .division.run .flash   { animation: flash 1100ms var(--ease) both; }
  .division.run .d-l     { animation: drift-l 1100ms var(--ease) both; }
  .division.run .d-r     { animation: drift-r 1100ms var(--ease) both; }

  @keyframes parent-divide {
    0%,30% { opacity: 1; transform: scale(1); }
    55%    { opacity: 1; transform: scaleX(1.18) scaleY(.9); }
    62%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes spindle {
    0%,28% { opacity: 0; transform: scaleX(.4); }
    50%    { opacity: .9; transform: scaleX(1); }
    66%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes flash {
    0%,52% { opacity: 0; transform: scale(.4); }
    60%    { opacity: 1; transform: scale(1.6); }
    74%    { opacity: 0; transform: scale(2.2); }
    100%   { opacity: 0; }
  }
  @keyframes drift-l {
    0%,58% { opacity: 0; transform: translateX(0); }
    66%    { opacity: 1; }
    100%   { opacity: 1; transform: translateX(-34px); }
  }
  @keyframes drift-r {
    0%,58% { opacity: 0; transform: translateX(0); }
    66%    { opacity: 1; }
    100%   { opacity: 1; transform: translateX(34px); }
  }

  /* Reduced motion: no animation; show the final split statically. */
  @media (prefers-reduced-motion: reduce) {
    .division .parent { opacity: 0; animation: none !important; }
    .division .spindle, .division .flash { opacity: 0; animation: none !important; }
    .division .d-l { opacity: 1; transform: translateX(-34px); animation: none !important; }
    .division .d-r { opacity: 1; transform: translateX(34px); animation: none !important; }
  }

  .division-trigger {
    margin-top: var(--space-4); font-size: var(--step--1); color: var(--ink-2);
    background: transparent; border: 1px solid var(--hairline-strong);
    border-radius: var(--r-sm); padding: 6px 12px; cursor: pointer;
    transition: color .14s var(--ease), border-color .14s var(--ease);
  }
  .division-trigger:hover { color: var(--magenta); border-color: var(--magenta); }
</style>

<script>
  // Play on load (unless reduced motion), and replay on trigger click.
  document.querySelectorAll('.division').forEach((el) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = () => {
      el.classList.remove('run'); void (el as HTMLElement).offsetWidth; el.classList.add('run');
    };
    if (!reduce) play();
    el.querySelector('.division-trigger')?.addEventListener('click', play);
  });
</script>
```

- [ ] **Step 2: Mount it on the preview page**

In `src/pages/tokens-preview.astro`, add the import to the frontmatter (after the `import Site` line):
```js
import Division from '../components/Division.astro';
```
And insert the signature section just below the `<h1>`/lede paragraph (before `<h2>Signal channels</h2>`):
```astro
    <div style="margin:var(--space-7) 0;"><Division size={260} /></div>
```

- [ ] **Step 3: Build + screenshot verification**

Run:
```bash
npm run build 2>&1 | grep -iE 'page\(s\)|error'
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --hide-scrollbars --force-color-profile=srgb \
  --window-size=1280,1000 --screenshot=/tmp/division.png --virtual-time-budget=2600 \
  "http://localhost:4321/tokens-preview/" 2>/dev/null; ls -la /tmp/division.png
```
Expected: build PASS; screenshot captured. **Visual gate (look at it):** a white-cored luminous cell on black; the final frame shows two daughters split apart with a magenta spindle trace and a white flash having fired at separation; black dominates. Iterate on timing/scale/glow live before committing if it does not read as "one cell becoming two."

- [ ] **Step 4: Commit**

```bash
git add src/components/Division.astro src/pages/tokens-preview.astro
git commit -m "feat(brand): add The Division signature animation"
```

---

### Task 2: Magenta buttons + nav restyle

**Files:**
- Modify: `src/layouts/Site.astro` (the `<style is:global>` button + nav rules)

**Interfaces:**
- Produces: `.btn-primary` = magenta emission CTA; `.btn-ghost` = hairline secondary; nav brand mark tinted magenta. Consumed sitewide.

- [ ] **Step 1: Replace the button rules**

In `src/layouts/Site.astro`, replace the existing `.btn-primary` / `.btn-primary:hover` / `.btn-ghost` / `.btn-ghost:hover` rules with:
```css
      .btn-primary { background: var(--magenta); color: var(--field); border-color: var(--magenta); font-weight: 600; }
      .btn-primary:hover { transform: translateY(-1px);
        box-shadow: 0 0 4px color-mix(in srgb, var(--magenta) 90%, transparent),
                    0 0 18px color-mix(in srgb, var(--magenta) 45%, transparent),
                    0 0 48px color-mix(in srgb, var(--magenta) 18%, transparent); }
      .btn-ghost { background: transparent; color: var(--ink); border-color: var(--hairline-strong); }
      .btn-ghost:hover { border-color: var(--magenta); color: var(--magenta); background: transparent; transform: translateY(-1px); }
```

- [ ] **Step 2: Tint the nav brand mark and clean residual white hovers**

In the same block, replace `.copy-btn:hover { color: var(--ink); border-color: #fff; }` and `.copy-btn.copied { color: #fff; border-color: #fff; }` with:
```css
      .copy-btn:hover { color: var(--ink); border-color: var(--hairline-strong); }
      .copy-btn.copied { color: var(--green); border-color: var(--green); }
```
And add, after the `.brand-mark` rule:
```css
      .brand-mark { filter: drop-shadow(0 0 6px color-mix(in srgb, var(--magenta) 60%, transparent)); }
```

- [ ] **Step 3: Build + screenshot the preview nav/buttons**

Run:
```bash
npm run build 2>&1 | grep -iE 'page\(s\)|error'
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --force-color-profile=srgb --window-size=1280,420 \
  --screenshot=/tmp/nav.png --virtual-time-budget=1500 "http://localhost:4321/tokens-preview/" 2>/dev/null
```
Expected: build PASS. Visual gate: "Start building" is a magenta pill; brand mark has a faint magenta emission; no leftover white-on-hover.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Site.astro
git commit -m "feat(brand): magenta-dominant buttons + nav brand emission"
```

---

### Task 3: Code / terminal block

**Files:**
- Modify: `src/layouts/Site.astro` (`.code-block` rule + new terminal chrome classes)

**Interfaces:**
- Produces: `.terminal` wrapper with a chrome bar (`.terminal-bar` + traffic dots) and a `.terminal-body`; signal-colored output via `.t-ok` (green), `.t-fork` (magenta). Consumed by the hero readout in plan 3.

- [ ] **Step 1: Replace `.code-block` and add terminal classes**

In `src/layouts/Site.astro`, replace the `.code-block` rule with:
```css
      .code-block { background: var(--field-2); border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 16px 18px; font-family: var(--mono); font-size: 12.5px; line-height: 1.7; color: var(--ink); overflow-x: auto; margin: 0; }
      .terminal { background: var(--field-1); border: 1px solid var(--hairline); border-radius: var(--r-lg); overflow: hidden; }
      .terminal-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--hairline); }
      .terminal-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--hairline-strong); }
      .terminal-body { padding: 16px 18px; font-family: var(--mono); font-size: 12.5px; line-height: 1.8; color: var(--ink-2); overflow-x: auto; }
      .terminal-body .t-ok { color: var(--green); }
      .terminal-body .t-fork { color: var(--magenta); }
      .terminal-body .t-dim { color: var(--ink-3); }
```

- [ ] **Step 2: Add a terminal demo to the preview page**

In `src/pages/tokens-preview.astro`, replace the existing `<pre class="mono" ...>` telemetry block with:
```astro
    <div class="terminal" style="max-width:520px;margin-top:var(--space-5);">
      <div class="terminal-bar"><i></i><i></i><i></i></div>
      <div class="terminal-body"><span class="t-dim">$</span> mitos <span class="t-fork">fork</span> --count 8
<span class="t-ok">  ✓ colony ready</span> · 8 daughters · 27ms · +3.1 MiB/fork</div>
    </div>
```

- [ ] **Step 3: Build + screenshot**

Run:
```bash
npm run build 2>&1 | grep -iE 'page\(s\)|error'
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --force-color-profile=srgb --window-size=1280,1100 \
  --screenshot=/tmp/terminal.png --virtual-time-budget=2000 "http://localhost:4321/tokens-preview/" 2>/dev/null
```
Expected: build PASS. Visual gate: a terminal card with chrome dots; `fork` in magenta, `✓ colony ready` in green, tabular figures aligned.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Site.astro src/pages/tokens-preview.astro
git commit -m "feat(brand): terminal/code block with signal-colored output"
```

---

### Task 4: Comparison table pattern

**Files:**
- Modify: `src/layouts/Site.astro` (add `.cmp` table rules)

**Interfaces:**
- Produces: `.cmp` table styles where the mitos column wins are marked with `--magenta`. Consumed by the comparison section in plan 3.

- [ ] **Step 1: Add comparison-table rules**

In `src/layouts/Site.astro`, add after the `.terminal-body` rules:
```css
      .cmp { width: 100%; border-collapse: collapse; font-size: 14px; }
      .cmp th, .cmp td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--hairline); }
      .cmp thead th { color: var(--ink-3); font-weight: 500; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
      .cmp th[scope="row"] { color: var(--ink-2); font-weight: 400; }
      .cmp .col-mitos { color: var(--ink); }
      .cmp .col-mitos .win { color: var(--magenta); }
      .cmp tbody tr:hover { background: rgba(255,255,255,.02); }
```

- [ ] **Step 2: Add a comparison demo to the preview page**

In `src/pages/tokens-preview.astro`, before the closing `</section>`, add:
```astro
    <h2 style="margin-top:var(--space-8);">Comparison</h2>
    <table class="cmp" style="max-width:620px;">
      <thead><tr><th>Capability</th><th class="col-mitos">mitos</th><th>Typical sandbox</th></tr></thead>
      <tbody>
        <tr><th scope="row">Live fork of a running VM</th><td class="col-mitos"><span class="win">Yes, ~27ms</span></td><td>Cold boot</td></tr>
        <tr><th scope="row">Marginal cost per daughter</th><td class="col-mitos"><span class="win">~3 MiB CoW</span></td><td>Whole VM</td></tr>
        <tr><th scope="row">Run it yourself</th><td class="col-mitos"><span class="win">Apache 2.0</span></td><td>Vendor cloud</td></tr>
      </tbody>
    </table>
```

- [ ] **Step 3: Build + screenshot**

Run:
```bash
npm run build 2>&1 | grep -iE 'page\(s\)|error'
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --force-color-profile=srgb --window-size=1280,1400 \
  --screenshot=/tmp/cmp.png --virtual-time-budget=2000 "http://localhost:4321/tokens-preview/" 2>/dev/null
```
Expected: build PASS. Visual gate: clean rule-divided table; mitos wins in magenta; no heavy borders.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Site.astro src/pages/tokens-preview.astro
git commit -m "feat(brand): comparison table pattern (magenta marks wins)"
```

---

### Task 5: The brand book (`docs/brand/brand-book.md`)

**Files:**
- Create: `docs/brand/brand-book.md`

**Interfaces:**
- Produces: the human-readable 12-section brand book — the prose source of truth. No code dependency; consumed by humans + future copy/design work.

- [ ] **Step 1: Write `docs/brand/brand-book.md`** with all 12 sections from spec §1, each filled with the concrete decisions already shipped in tokens.css/base.css and the components above. Sections: 1 Foundation (positioning "One agent divides into a thousand", the mitosis metaphor, audience = AI agent engineers), 2 Logo & mark, 3 Color (the palette table + the four glow rules + rationing), 4 Typography (Satoshi + Geist Mono, scale, weights, tracking), 5 Spacing & layout (8px scale, reticle, radii), 6 Motion, 7 The Division (the animation states + timing from Task 1), 8 Voice & vocabulary (owned four words + the anti-slop never/always lists from spec §8), 9 Components (buttons, nav, terminal, comparison — as built), 10 OG/social, 11 Accessibility (contrast results from plan 1: ink 17.85, magenta 6.73, etc.), 12 Anti-slop guardrails (the consolidated checklist from spec §12). Pull values verbatim from `src/styles/tokens.css` so the book and code agree.

- [ ] **Step 2: Verify no contradiction with tokens**

Run: `grep -E '#FF45C8|#3DDCFF|#04050A|Satoshi|Geist Mono' docs/brand/brand-book.md | head`
Expected: the book cites the same hex/font values as `tokens.css` (magenta `#FF45C8`, cyan `#3DDCFF`, field `#04050A`).

- [ ] **Step 3: Commit**

```bash
git add docs/brand/brand-book.md
git commit -m "docs(brand): the Fluorescence brand book (12 sections)"
```

---

### Task 6: The enforceable design system (`.interface-design/system.md`)

**Files:**
- Create: `.interface-design/system.md`

**Interfaces:**
- Produces: the machine-readable system mirror used by the `interface-design` plugin's `/audit` and `/critique` to stop defaults creeping back. Token names + values + the "never" rules in the plugin's expected format.

- [ ] **Step 1: Write `.interface-design/system.md`** capturing: the direction ("Fluorescence — a live-cell fluorescence microscope; magenta-dominant on true black"), the token table (names + values from tokens.css), the type roles, spacing scale, radii, motion, and the hard rules (additive white-cored glow only; <10% lit; magenta = emitted signal only; never Inter/system fonts; near-black not #000; white-alpha text not gray hex; one-sided card borders banned; no flat neon ring). Reference `src/styles/tokens.css` as the source of truth.

- [ ] **Step 2: Verify presence + key rule**

Run: `grep -c -- '--magenta' .interface-design/system.md && grep -ci 'additive' .interface-design/system.md`
Expected: both ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add .interface-design/system.md
git commit -m "docs(brand): enforceable design-system mirror for /audit + /critique"
```

---

## Self-Review

**1. Spec coverage (phases 2–4 of §14):** the Division → Task 1; components (buttons/nav/terminal/comparison) → Tasks 2–4; brand book → Task 5; system.md → Task 6. Pricing + card components are explicitly deferred to plan 3 (page-coupled) and noted in the scope line. ✓

**2. Placeholder scan:** Tasks 1–4 contain complete code. Tasks 5–6 are documentation tasks that legitimately describe section content rather than pre-writing the entire prose doc (the content is the deterministic transcription of already-shipped tokens + spec §8/§12); each has a concrete verification grep. Acceptable — not a code placeholder. ✓

**3. Type/name consistency:** class names introduced (`.division`, `.run`, `.spindle`, `.flash`, `.d-l/.d-r`, `.btn-primary`, `.terminal`, `.t-ok/.t-fork/.t-dim`, `.cmp`, `.col-mitos`, `.win`) are each defined in the task that introduces them and reused consistently in the preview-page demos. The Division `trigger` prop default (true) matches its usage. ✓

**Known follow-ups (not blockers):** (a) The Division is the one creative artifact expected to need live iteration on timing/scale/glow — Task 1 Step 3 calls this out. (b) `tokens-preview.astro` accumulates demos through this plan and is deleted in plan 3. (c) The fractal 8-way fan-out (logo→hero→OG scaling) is introduced minimally here (single division); the multi-cell hero composition is assembled during the page rebuild in plan 3.
