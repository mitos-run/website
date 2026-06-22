# Fluorescence Token Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the canonical Fluorescence design-token layer (color, type, space, motion), self-host the brand fonts, and render the dark "microscope field" globally — the bedrock every later phase consumes.

**Architecture:** Move all design tokens out of inline `<style>` blocks into `src/styles/tokens.css` (single source of truth). Add `src/styles/base.css` for `@font-face`, element resets, the field/grain/reticle, and a reusable glow utility. Wire both into `src/layouts/Site.astro` via `import`. The page rebuild and components come in later plans; this plan is verified on a temporary token-preview page.

**Tech Stack:** Astro 6.4.8, Starlight 0.40, plain CSS custom properties (no Tailwind), self-hosted woff2 (Satoshi via Fontshare, Geist Mono).

## Plan sequence (this is plan 1 of 3)
1. **Token foundation** (this plan) — tokens.css, fonts, base.css, field/grain/reticle, wired into Site.astro.
2. **The system** — brand-book.md + `.interface-design/system.md`, the Division animation, component patterns.
3. **The page** — rebuild `index.astro` on tokens, copy pass, OG system, a11y/audit verification.

## Global Constraints

Copied verbatim from `docs/superpowers/specs/2026-06-22-fluorescence-brand-book-design.md`:
- **Field is `#04050A`** (true near-black). Never `#000`. Elevation by lightness ladder, never drop-shadow.
- **Magenta-dominant:** `--magenta: #FF45C8` is the brand signature; `--cyan: #3DDCFF` is the steady secondary channel; `--green: #4DF0A0` and `--amber: #FFC24B` are rationed tertiary states.
- **Text = white-at-opacity tiers**, never gray hex: `--ink` `.94` / `--ink-2` `.62` / `--ink-3` `.40`.
- **Glow = additive + white-cored + layered**, `mix-blend-mode: screen`; never a flat neon ring; never animate `box-shadow` blur (use transform/opacity).
- **< 10% of any frame lit at full intensity.** Color encodes a real entity only — never gradient filler.
- **Fonts:** Satoshi (display+body, self-hosted), Geist Mono (data/code, self-hosted). Never Inter/Roboto/system or Space Grotesk. `font-display: swap`.
- **Type:** light display weights (300/400) at large sizes; tracking `-0.03em` display; tabular figures for all numerics.
- **Motion:** transform/opacity only, `<500ms`, `cubic-bezier(.2,1,.2,1)`, `prefers-reduced-motion` honored.
- **Sensor grain** (~2–4% opacity) + **focus-reticle/graticule** field motif (5–20% opacity) replace the dot-grid.
- **A11y:** body ≥4.5:1, large/bold ≥3:1, UI/focus ≥3:1; visible keyboard focus; colorblind-safe palette.
- **Copy:** never em/en dashes in site copy (existing repo rule); no slop lexicon.

---

### Task 1: Scaffold `src/styles/tokens.css` (the single source of truth)

**Files:**
- Create: `src/styles/tokens.css`
- Test: `npm run build` + grep assertions (no unit-test framework in this repo; verification is build + grep + visual)

**Interfaces:**
- Produces: CSS custom properties on `:root` consumed by every later task and plan — names are the contract: `--field`, `--field-1`, `--field-2`, `--hairline`, `--hairline-strong`, `--ink`, `--ink-2`, `--ink-3`, `--magenta`, `--cyan`, `--green`, `--amber`, `--signal-core`, `--sans`, `--mono`, `--step--1`…`--step-6`, `--lh-tight`/`--lh-body`, `--track-display`, `--space-1`…`--space-10`, `--r-sm`/`--r-md`/`--r-lg`, `--ease`, `--dur`, `--maxw`.

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
/* Fluorescence design tokens — single source of truth.
   Spec: docs/superpowers/specs/2026-06-22-fluorescence-brand-book-design.md
   Edit tokens here ONLY. Pages/components reference var(--*), never raw hex. */
:root {
  /* ---- Field (canvas). Elevation = lightness ladder, never shadow. ---- */
  --field: #04050A;            /* base void. never #000 */
  --field-1: #0A0C12;          /* raised panel / card */
  --field-2: #11141C;          /* raised +2: popover / inset */
  --hairline: rgba(255, 255, 255, 0.08);
  --hairline-strong: rgba(255, 255, 255, 0.14);

  /* ---- Ink: white at opacity, never gray hex ---- */
  --ink: rgba(236, 240, 250, 0.94);
  --ink-2: rgba(236, 240, 250, 0.62);
  --ink-3: rgba(236, 240, 250, 0.40);

  /* ---- Signal channels: color = meaning only ---- */
  --magenta: #FF45C8;          /* PRIMARY signature: division / spindle / fork */
  --cyan: #3DDCFF;             /* secondary: genome / parent / steady "alive" */
  --green: #4DF0A0;            /* tertiary: live / ready */
  --amber: #FFC24B;            /* tertiary: warning / winner */
  --signal-core: #FFFFFF;      /* white-hot emission core; cyan+magenta overlap */

  /* ---- Typography ---- */
  --sans: 'Satoshi', system-ui, -apple-system, sans-serif;
  --mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  /* modular scale ~1.25, light display weights live in base.css */
  --step--1: 0.8rem;
  --step-0: 1rem;
  --step-1: 1.25rem;
  --step-2: 1.563rem;
  --step-3: 1.953rem;
  --step-4: 2.441rem;
  --step-5: clamp(2.6rem, 5vw, 3.815rem);
  --step-6: clamp(3.2rem, 7vw, 5.96rem);
  --lh-tight: 1.02;
  --lh-body: 1.5;
  --track-display: -0.03em;

  /* ---- Spacing (8px base) ---- */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 128px;

  /* ---- Radii: tight, deliberate ---- */
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px;

  /* ---- Motion ---- */
  --ease: cubic-bezier(.2, 1, .2, 1);
  --dur: 240ms;

  /* ---- Layout ---- */
  --maxw: 1140px;
}
```

- [ ] **Step 2: Verify the file is valid CSS and present**

Run: `npx astro check 2>/dev/null; grep -c -- '--magenta: #FF45C8' src/styles/tokens.css`
Expected: prints `1` (the magenta token exists exactly once).

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(brand): add Fluorescence design tokens (single source of truth)"
```

---

### Task 2: Self-host the brand fonts (Satoshi + Geist Mono)

**Files:**
- Create: `public/fonts/Satoshi-Variable.woff2`, `public/fonts/GeistMono-Variable.woff2`
- Create: `src/styles/base.css` (the `@font-face` block; element defaults added in Task 3)

**Interfaces:**
- Produces: the `'Satoshi'` and `'Geist Mono'` font families referenced by `--sans` / `--mono` from Task 1.

- [ ] **Step 1: Download Satoshi (variable) from Fontshare**

Run:
```bash
mkdir -p public/fonts /tmp/satoshi
curl -fsSL -o /tmp/satoshi.zip "https://api.fontshare.com/v2/fonts/download/satoshi"
unzip -o /tmp/satoshi.zip -d /tmp/satoshi >/dev/null
# Fontshare ships variable woff2 under fonts/variable/ or similar; copy the variable file:
find /tmp/satoshi -iname '*Satoshi-Variable*.woff2' -exec cp {} public/fonts/Satoshi-Variable.woff2 \;
ls -la public/fonts/Satoshi-Variable.woff2
```
Expected: a non-zero `Satoshi-Variable.woff2` (~50–120 KB). If `find` matched nothing, run `find /tmp/satoshi -iname '*.woff2'` and copy the variable (or 400-weight) file manually to that exact path.

- [ ] **Step 2: Download Geist Mono (variable) woff2**

Run:
```bash
curl -fsSL -o public/fonts/GeistMono-Variable.woff2 \
  "https://cdn.jsdelivr.net/npm/geist@latest/dist/fonts/geist-mono/GeistMono-Variable.woff2"
ls -la public/fonts/GeistMono-Variable.woff2
```
Expected: a non-zero `GeistMono-Variable.woff2` (~50–90 KB). If jsDelivr path 404s, get it from `https://github.com/vercel/geist-font/raw/main/packages/next/dist/fonts/geist-mono/GeistMono-Variable.woff2`.

- [ ] **Step 3: Create `src/styles/base.css` with the `@font-face` block**

```css
/* Base layer: fonts, element defaults, the field, glow utility.
   Consumes tokens from tokens.css. */

@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Variable.woff2') format('woff2-variations');
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}
```

- [ ] **Step 4: Verify font files load (build + size check)**

Run: `npm run build && ls -la public/fonts/*.woff2`
Expected: build succeeds; both woff2 files present and non-zero.

- [ ] **Step 5: Commit**

```bash
git add public/fonts/Satoshi-Variable.woff2 public/fonts/GeistMono-Variable.woff2 src/styles/base.css
git commit -m "feat(brand): self-host Satoshi + Geist Mono, add @font-face"
```

---

### Task 3: Element defaults in `base.css` (reset, type, focus, selection)

**Files:**
- Modify: `src/styles/base.css` (append below the `@font-face` block from Task 2)

**Interfaces:**
- Consumes: all tokens from Task 1; the font families from Task 2.
- Produces: global element styling so any page wrapped in the layout inherits the Fluorescence baseline. Utility classes `.mono`, `.muted`, `.container`.

- [ ] **Step 1: Append element defaults to `src/styles/base.css`**

```css
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 84px; }
body {
  margin: 0;
  background: var(--field);
  color: var(--ink);
  font-family: var(--sans);
  font-weight: 400;
  line-height: var(--lh-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}
h1, h2, h3 {
  font-weight: 400;                 /* light display reads expensive */
  letter-spacing: var(--track-display);
  line-height: var(--lh-tight);
  text-wrap: balance;
  margin: 0 0 var(--space-4);
}
h1 { font-size: var(--step-6); }
h2 { font-size: var(--step-4); }
h3 { font-size: var(--step-2); }
p { text-wrap: pretty; }
a { color: inherit; text-decoration: none; }
.mono {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
.muted { color: var(--ink-2); }
.container { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--space-5); }
::selection { background: var(--magenta); color: var(--field); }
:focus-visible { outline: 2px solid var(--magenta); outline-offset: 3px; border-radius: var(--r-sm); }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

- [ ] **Step 2: Verify build still succeeds**

Run: `npm run build`
Expected: PASS (no CSS parse errors).

- [ ] **Step 3: Commit**

```bash
git add src/styles/base.css
git commit -m "feat(brand): element defaults consuming Fluorescence tokens"
```

---

### Task 4: The field — sensor grain, reticle motif, and the glow utility

**Files:**
- Modify: `src/styles/base.css` (append)

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: a `.field` backdrop (grain + reticle) intended for a fixed full-viewport layer, and a `.glow` / `--glow-color` utility (additive, white-cored, layered) reused by buttons, the Division, and signal elements in later plans.

- [ ] **Step 1: Append the field + glow layer to `src/styles/base.css`**

```css
/* The microscope field: true-black base + faint reticle + sensor grain.
   Intended on a fixed, pointer-events:none layer behind content. */
.field {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    /* reticle / graticule: faint calibration lines, 5-20% via low alpha */
    repeating-linear-gradient(0deg, rgba(255,255,255,.022) 0 1px, transparent 1px 96px),
    repeating-linear-gradient(90deg, rgba(255,255,255,.022) 0 1px, transparent 1px 96px),
    var(--field);
}
/* Sensor grain: ~3% opacity fractal noise, defeats banding, reads as a detector. */
.field::after {
  content: ""; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .035; mix-blend-mode: screen;
}
main, .nav, .footer { position: relative; z-index: 1; }

/* Additive, white-cored, layered glow. Set --glow-color per element.
   Apply .glow to an element whose background is the channel color so the
   emission reads as self-luminous on black. Never animate the blur. */
.glow {
  --glow-color: var(--magenta);
  box-shadow:
    0 0 4px color-mix(in srgb, var(--glow-color) 90%, transparent),
    0 0 16px color-mix(in srgb, var(--glow-color) 40%, transparent),
    0 0 48px color-mix(in srgb, var(--glow-color) 16%, transparent);
}
```

- [ ] **Step 2: Verify build succeeds and grain/reticle assertions hold**

Run: `npm run build && grep -c 'feTurbulence' src/styles/base.css && grep -c 'mix-blend-mode: screen' src/styles/base.css`
Expected: build PASS; both greps print `1` (grain present, additive blend present).

- [ ] **Step 3: Commit**

```bash
git add src/styles/base.css
git commit -m "feat(brand): microscope field (grain + reticle) and additive glow utility"
```

---

### Task 5: Wire the token layer into `Site.astro` (remove inline duplication)

**Files:**
- Modify: `src/layouts/Site.astro` — replace the inline `:root` + base styles (lines ~153–254) with imports; swap Google-fonts `<link>` (lines 57–62) for nothing (self-hosted now); add font preload.

**Interfaces:**
- Consumes: `src/styles/tokens.css`, `src/styles/base.css`.
- Produces: a layout whose styling comes entirely from the shared layer; the `.field` div is rendered once globally. Existing `pricing.astro` / `benchmarks.astro` (which use this layout) keep working but now render dark-Fluorescence.

- [ ] **Step 1: Import the stylesheets in the Site.astro frontmatter**

In `src/layouts/Site.astro`, add to the top of the frontmatter (after line 6 `import Mark`):

```js
import '../styles/tokens.css';
import '../styles/base.css';
```

- [ ] **Step 2: Replace the Google-fonts links with self-hosted preloads**

Replace lines 57–62 (the `preconnect` + Google `css2` `<link>`) with:

```html
    <link rel="preload" href="/fonts/Satoshi-Variable.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/GeistMono-Variable.woff2" as="font" type="font/woff2" crossorigin />
```

- [ ] **Step 3: Update theme-color and the field div**

Change line 40 `<meta name="theme-color" content="#000000" />` to:

```html
    <meta name="theme-color" content="#04050A" />
```

Replace line 65 `<div class="hero-glow" aria-hidden="true"></div>` with:

```html
    <div class="field" aria-hidden="true"></div>
```

- [ ] **Step 4: Delete the inline `<style is:global>` token + base rules now living in the shared layer**

In `src/layouts/Site.astro`, within the `<style is:global>` block (lines ~153–254): delete the entire `:root { … }` declaration (now in tokens.css), the `* { box-sizing }`, `html`, `body`, `::selection`, `.container`, `.mono`, `.muted`, `a`, `:focus-visible`, `h1/h2` rules, and the old `.hero-glow` rule (replaced by `.field`). KEEP the component rules that this plan does not yet redefine (`.btn*`, `.nav*`, `.footer*`, `.code-block`, `.page-hero*`, `.reveal`, `section`, `.section-*`, `.copy-btn`) — those are migrated in plan 3. Anywhere a kept rule references a now-removed variable (`--bg`, `--surface`, `--text`, `--muted`, `--border`, `--border-strong`, `--border-2`, `--elev`, `--dim`, `--text-2`), replace with the nearest Fluorescence token: `--bg`→`--field`, `--surface`→`--field-1`, `--surface-2`/`--elev`→`--field-2`, `--text`/`--text-2`→`--ink`, `--muted`→`--ink-2`, `--dim`→`--ink-3`, `--border`→`--hairline`, `--border-strong`/`--border-2`→`--hairline-strong`.

- [ ] **Step 5: Verify build + no orphaned legacy variables remain in the layout**

Run:
```bash
npm run build && grep -nE '\-\-(bg|surface|elev|text|muted|dim|border)\b' src/layouts/Site.astro || echo "NO_LEGACY_VARS"
```
Expected: build PASS; prints `NO_LEGACY_VARS` (every legacy variable reference migrated).

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Site.astro
git commit -m "refactor(brand): wire tokens.css + base.css into Site.astro; render the field"
```

---

### Task 6: Token-preview page — visual + contrast verification

**Files:**
- Create: `src/pages/_tokens.astro` (temporary internal preview; underscore-prefixed so it is not built as a public route — confirm, else name `tokens-preview.astro` and delete after plan 3)

**Interfaces:**
- Consumes: the full token layer + layout. This is the human-in-the-loop visual gate for the foundation.

- [ ] **Step 1: Create `src/pages/_tokens.astro`**

```astro
---
import Site from '../layouts/Site.astro';
const channels = [
  { name: 'magenta (signature)', v: 'var(--magenta)' },
  { name: 'cyan (steady)', v: 'var(--cyan)' },
  { name: 'green (live)', v: 'var(--green)' },
  { name: 'amber (warn)', v: 'var(--amber)' },
];
---
<Site title="tokens — fluorescence" description="internal token preview">
  <section class="container" style="padding:var(--space-9) 0;">
    <h1>One agent divides into a thousand</h1>
    <p class="muted" style="font-size:var(--step-1);max-width:32em;">
      Light display weight, tight tracking, on the true black field.
    </p>

    <h2 style="margin-top:var(--space-8);">Signal channels</h2>
    <div style="display:flex;gap:var(--space-5);flex-wrap:wrap;margin-top:var(--space-5);">
      {channels.map((c) => (
        <div style="text-align:center;">
          <div class="glow" style={`--glow-color:${c.v};width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 50% 45%, var(--signal-core), ${c.v} 60%);`}></div>
          <p class="mono" style="font-size:var(--step--1);margin-top:var(--space-3);">{c.name}</p>
        </div>
      ))}
    </div>

    <h2 style="margin-top:var(--space-8);">Telemetry (Geist Mono, tabular)</h2>
    <pre class="mono" style="background:var(--field-1);border:1px solid var(--hairline);border-radius:var(--r-md);padding:var(--space-4);">  colony ready · 8 daughters · 27ms · +3.1 MiB/fork</pre>
  </section>
</Site>
```

- [ ] **Step 2: Run the dev server and view the preview**

Run: `npm run dev` (server already runs on :4321 per session). Visit `http://localhost:4321/_tokens/`.
Expected (visual gate — confirm by eye / screenshot): true-black field with faint reticle + grain; four self-luminous discs with **white-hot cores** and colored halos (magenta brightest/dominant); Satoshi renders the heading at a light weight; Geist Mono renders the telemetry with aligned tabular figures. No flat neon rings; black dominates (<10% lit).

- [ ] **Step 3: Verify contrast floors (magenta/cyan/ink on field)**

Run:
```bash
node -e '
const hexL=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>{const L1=hexL(a),L2=hexL(b);return((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)).toFixed(2)};
const field="#04050A";
for(const[n,c]of[["ink≈#ECF0FA","#ECF0FA"],["magenta","#FF45C8"],["cyan","#3DDCFF"],["green","#4DF0A0"],["amber","#FFC24B"]])
  console.log(n.padEnd(14), ratio(c,field), ":1 on field");
'
```
Expected: `ink` ≥ 4.5; `magenta`, `cyan`, `green`, `amber` each ≥ 3:1 (large/UI floor). Record any channel below 3:1 as a follow-up to nudge its lightness in tokens.css (do not block the plan; note it).

- [ ] **Step 4: Commit**

```bash
git add src/pages/_tokens.astro
git commit -m "test(brand): token-preview page for visual + contrast verification"
```

---

## Self-Review

**1. Spec coverage (Phase 1 of §14):** tokens.css → Task 1; self-host fonts → Task 2; base.css element defaults → Task 3; field + grain + reticle + glow → Task 4; wire into Site.astro → Task 5; "verify on a throwaway page" → Task 6. Palette (§3), ink tiers (§3.2), glow rules (§3.4), type (§4), spacing/radii (§5), motion (§6) tokens are all materialized. Brand book, Division, components, page rebuild, copy, OG, full a11y audit are explicitly deferred to plans 2–3. ✓

**2. Placeholder scan:** No "TBD/handle edge cases/similar to". Font-download steps give exact commands plus a named fallback URL (an honest real-world fetch step, with a size assertion), not a placeholder. ✓

**3. Type/name consistency:** Variable names in Task 6 / Task 5 (`--field`, `--magenta`, `--ink-2`, `--glow-color`, `--step-6`, `--r-md`) all match the definitions in Task 1 / Task 4. The legacy→Fluorescence variable map in Task 5 Step 4 covers every variable the kept component rules reference. ✓

**Known follow-ups (not blockers):** (a) Task 5 keeps the old component rules alive on Fluorescence tokens so the site stays buildable; they are properly restyled in plan 3. (b) If a channel falls below 3:1 in Task 6 Step 3, nudge lightness in tokens.css. (c) `_tokens.astro` is deleted at the end of plan 3.
