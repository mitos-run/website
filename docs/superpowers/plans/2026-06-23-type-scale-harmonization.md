# Type-scale Harmonization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route every `font-size` in the site through one semantic `--text-*` token set so the type scale is consistent and maintainable, with pages rendering ~identically.

**Architecture:** Add semantic role tokens to `tokens.css` (retiring the unused `--step-*`), then sweep each component/page replacing ad-hoc `px`/`clamp()` font-sizes with `var(--text-*)`. This is a mechanical refactor: there is no unit-test surface, so each task's verification is (a) an Astro build that succeeds and (b) a per-file grep proving no un-tokenized `font-size` remains except documented exceptions.

**Tech Stack:** Astro 6, scoped `<style>` in `.astro` files, plain CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-06-23-type-scale-harmonization-design.md`

## Global Constraints

- **Preserve the look.** Snaps of <1.5px are fine; no deliberate re-tuning. If an
  edit would visibly change a page beyond a sub-pixel snap, stop and flag it.
- **Tokens only.** Every `font-size` becomes `var(--text-*)` except the documented
  exceptions (numeric readouts, SVG `text`, the 404 glyph, hand-tuned
  mobile/overflow literals — each kept with a `/* … */` comment).
- **No `--step-*` references may remain** anywhere in `src/`.
- **Do not touch** `src/pages/og-template.astro` (it's an OG image canvas).
- The token only sets size. Existing `font-weight`, `letter-spacing`,
  `text-transform`, `line-height`, `color`, and `max-width` at each call site stay
  exactly as they are.

**Canonical token set** (defined in Task 1; reproduced here for reference):

| Token | Value |
|---|---|
| `--text-display` | `clamp(46px, 6vw, 76px)` |
| `--text-display-sm` | `clamp(30px, 8.4vw, 48px)` |
| `--text-display-compact` | `clamp(40px, 4.6vw, 60px)` |
| `--text-h2` | `clamp(28px, 3.6vw, 42px)` |
| `--text-h2-sm` | `clamp(24px, 7vw, 32px)` |
| `--text-h3` | `clamp(22px, 2.6vw, 28px)` |
| `--text-cta` | `clamp(30px, 5vw, 52px)` |
| `--text-lede` | `19px` |
| `--text-title` | `18px` |
| `--text-body` | `17px` |
| `--text-ui` | `15px` |
| `--text-dense` | `14px` |
| `--text-caption` | `13px` |
| `--text-micro` | `12px` |
| `--text-nano` | `11px` |
| `--text-code` | `13px` |
| `--text-code-block` | `12.5px` |

---

## Task 1: Tokens + base layer

**Files:**
- Modify: `src/styles/tokens.css:28-39` (replace the `--step-*` block + line-heights)
- Modify: `src/styles/base.css:39-41,56-57`

**Interfaces:**
- Produces: all `--text-*` tokens and `--lh-prose`/`--lh-snug`, consumed by every later task.

- [ ] **Step 1: Replace the `--step-*` block in `tokens.css`**

Replace lines 28–39 (the comment + `--step--1 … --step-6` + `--lh-*` + `--track-display`) with:

```css
  /* modular type roles; light display weights live in base.css */
  --text-display:         clamp(46px, 6vw, 76px);
  --text-display-sm:      clamp(30px, 8.4vw, 48px);
  --text-display-compact: clamp(40px, 4.6vw, 60px);
  --text-h2:              clamp(28px, 3.6vw, 42px);
  --text-h2-sm:           clamp(24px, 7vw, 32px);
  --text-h3:              clamp(22px, 2.6vw, 28px);
  --text-cta:             clamp(30px, 5vw, 52px);
  --text-lede:       19px;
  --text-title:      18px;
  --text-body:       17px;
  --text-ui:         15px;
  --text-dense:      14px;
  --text-caption:    13px;
  --text-micro:      12px;
  --text-nano:       11px;
  --text-code:       13px;
  --text-code-block: 12.5px;
  --lh-tight: 1.02;
  --lh-snug:  1.55;
  --lh-body:  1.5;
  --lh-prose: 1.7;
  --track-display: -0.03em;
```

> `--lh-snug`/`--lh-prose` are added as named reference rhythms only. This pass is
> scoped to `font-size` (the issue's subject); existing `line-height` values stay
> at their call sites so the vertical rhythm does not change. Keep them defined.

- [ ] **Step 2: Repoint `base.css` element defaults and section classes**

Apply these exact substitutions:

| Location | From | To |
|---|---|---|
| `base.css:39` `h1` | `var(--step-6)` | `var(--text-display)` |
| `base.css:40` `h2` | `var(--step-4)` | `var(--text-h2)` |
| `base.css:41` `h3` | `var(--step-2)` | `var(--text-h3)` |
| `base.css:56` `.section-title` | `clamp(28px, 3.6vw, 42px)` | `var(--text-h2)` |
| `base.css:57` `.section-lede` | `17px` | `var(--text-body)` |

- [ ] **Step 3: Verify no `--step-*` remains and the build passes**

```bash
grep -rn "step-" src/ ; echo "--- (expect no matches above) ---"
npm run build
```
Expected: grep prints nothing; build completes with no error.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/styles/base.css
git commit -m "refactor(type): semantic --text-* tokens; retire --step-* (#26)"
```

---

## Task 2: Layout (`Site.astro`)

**Files:**
- Modify: `src/layouts/Site.astro` (the `<style>` block, lines ~236–305)

**Interfaces:**
- Consumes: `--text-*` from Task 1.

- [ ] **Step 1: Apply substitutions**

| Selector | From | To |
|---|---|---|
| `.btn` | `font-size: 14px` | `var(--text-dense)` |
| `.btn-lg` | `font-size: 15px` | `var(--text-ui)` |
| `.copy-btn` | `font-size: 11px` | `var(--text-nano)` |
| `.brand` | `font-size: 17px` | `var(--text-title)` |
| `.nav-links a` | `font-size: 14px` | `var(--text-dense)` |
| `.ghost-link` | `font-size: 14px` | `var(--text-dense)` |
| `.nav-menu-links a` | `font-size: 23px` | **keep `23px`**, add `/* mobile-menu tap target */` |
| `.section-title` | `clamp(28px, 4vw, 40px)` … `font-weight: 600` | `var(--text-h2)`; **change `font-weight` to `400`** and `letter-spacing` to `var(--track-display)` (kills the drift variant) |
| `.section-lede` | `font-size: 17px` | `var(--text-body)` |
| `.code-block` | `font-size: 12.5px` | `var(--text-code-block)` |
| `.terminal-body` | `font-size: 12.5px` | `var(--text-code-block)` |
| `.cmp` | `font-size: 14px` | `var(--text-dense)` |
| `.cmp thead th` | `font-size: 12px` | `var(--text-micro)` |
| `.page-hero .eyebrow` | `font-size: 12.5px` | `var(--text-micro)` |
| `.page-hero h1` | `clamp(38px, 5vw, 60px)` | `var(--text-display-compact)` |
| `.page-hero .lede` | `font-size: 19px` | `var(--text-lede)` |

- [ ] **Step 2: Verify**

```bash
grep -n "font-size" src/layouts/Site.astro | grep -vE "var\(--text|23px"
npm run build
```
Expected: grep prints nothing (only the commented `23px` is exempt); build passes.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Site.astro
git commit -m "refactor(type): tokenize layout font-sizes (#26)"
```

---

## Task 3: Shared components

**Files:**
- Modify: `src/components/SiteFooter.astro`, `src/components/Analytics.astro`, `src/components/GhStars.astro`, `src/components/Division.astro`

- [ ] **Step 1: `SiteFooter.astro`**

| Selector | From | To |
|---|---|---|
| `.brand` | `17px` | `var(--text-title)` |
| `.footer-tag` | `14px` | `var(--text-dense)` |
| `.footer-h h2` | `13px` | `var(--text-caption)` |
| `.footer-col nav a` | `14px` | `var(--text-dense)` |
| `.footer-bottom` | `13px` | `var(--text-caption)` |
| `.footer-top` | `13px` | `var(--text-caption)` |
| `.footer-h::after` | `18px` | `var(--text-title)` |

- [ ] **Step 2: `Analytics.astro` (consent banner)**

| Selector | From | To |
|---|---|---|
| `.cookie-eyebrow` | `10.5px` | `var(--text-nano)` |
| `.cookie-text` | `13px` | `var(--text-caption)` |
| `.cookie-btn` | `13px` | `var(--text-caption)` |

- [ ] **Step 3: `GhStars.astro`**

| Selector | From | To |
|---|---|---|
| `.gh-star` | `13px` | `var(--text-caption)` |
| `.gh-star-glyph` | `12px` | `var(--text-micro)` |

- [ ] **Step 4: `Division.astro`**

| Selector | From | To |
|---|---|---|
| (figure caption, line ~109) | `var(--step--1)` | `var(--text-caption)` |

- [ ] **Step 5: Verify**

```bash
grep -n "font-size" src/components/*.astro | grep -vE "var\(--text"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 6: Commit**

```bash
git add src/components/SiteFooter.astro src/components/Analytics.astro src/components/GhStars.astro src/components/Division.astro
git commit -m "refactor(type): tokenize component font-sizes (#26)"
```

---

## Task 4: Home (`index.astro`)

**Files:**
- Modify: `src/pages/index.astro` (`<style>`, lines ~450–628)

- [ ] **Step 1: Apply desktop substitutions**

| Selector | From | To |
|---|---|---|
| `.hero-copy h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.lede-sub` | `15px` | `var(--text-ui)` |
| `.spec` | `12.5px` | `var(--text-caption)` |
| `.install-cmd` | `13px` | `var(--text-code)` |
| `.hcopy` | `11px` | `var(--text-nano)` |
| `.tab` | `13px` | `var(--text-caption)` |
| `.code-panel` | `12.5px` | `var(--text-code-block)` |
| `.surf-note` | `12px` | `var(--text-micro)` |
| `.trust` | `12.5px` | `var(--text-caption)` |
| `.section-title` | `clamp(28px,3.6vw,42px)` | `var(--text-h2)` |
| `.section-lede` | `17px` | `var(--text-body)` |
| `.section-lede .muted` | `13px` | `var(--text-caption)` |
| `.division-h` | `clamp(28px,4vw,44px)` | `var(--text-h2)` |
| `.division-lede` | `16.5px` | `var(--text-body)` |
| `.fan-daughter text`, `.fan-parent text` | `13px` | **keep** `/* SVG */` |
| `.fan-parent .parent-label` | `14px` | **keep** `/* SVG */` |
| `.division-stats .sv` | `24px` | **keep** `/* readout */` |
| `.division-stats .sl` | `12px` | `var(--text-micro)` |
| `.uc-item h3` | `15px` | `var(--text-ui)` |
| `.uc-item p` | `14px` | `var(--text-dense)` |
| `.tech-chip` | `12px` | `var(--text-micro)` |
| `.step-n` | `13px` | `var(--text-caption)` |
| `.step h3` | `18px` | `var(--text-title)` |
| `.step p` | `14.5px` | `var(--text-ui)` |
| `.hosted-item h3` | `15px` | `var(--text-ui)` |
| `.hosted-item p` | `14px` | `var(--text-dense)` |
| `.comp-table` | `14px` | `var(--text-dense)` |
| `.comp-table thead th` | `12px` | `var(--text-micro)` |
| `.comp-table .mk` | `15px` | `var(--text-ui)` |
| `.comp-table .ct` | `11px` | `var(--text-nano)` |
| `.pillar h3` | `clamp(21px,2.3vw,27px)` | `var(--text-h3)` |
| `.pillar p` | `16px` | `var(--text-body)` |
| `.faq-item summary` | `16px` | `var(--text-body)` |
| `.faq-item summary::after` | `18px` | `var(--text-title)` |
| `.faq-item p` | `14.5px` | `var(--text-ui)` |
| `.final-cta h2` | `clamp(30px,5vw,52px)` | `var(--text-cta)` |

- [ ] **Step 2: Apply mobile-override substitutions (inside `@media (max-width: …)`)**

| Selector | From | To |
|---|---|---|
| `.hero-copy h1` | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |
| `.lede` | `17px` | `var(--text-body)` |
| `.division-h` | `21px` | **keep** `/* overflow-tuned */` |
| `.division-lede` | `15px` | `var(--text-ui)` |
| `.division-stats .sv` | `20px` | **keep** `/* readout */` |
| `.section-title` | `clamp(24px,7vw,32px)` | `var(--text-h2-sm)` |
| `.pillar h3` | `22px` | **delete this declaration** (no-op; `--text-h3` already floors at 22) |
| `.tab` | `12px` | `var(--text-micro)` |
| `.install-cmd` | `12px` | `var(--text-micro)` |
| `.code-panel` | `11.5px` | **keep** `/* overflow-tuned mono */` |
| `.comp-table` | `13px` | `var(--text-caption)` |

- [ ] **Step 3: Verify**

```bash
grep -n "font-size" src/pages/index.astro | grep -vE "var\(--text|/\* SVG|/\* readout|/\* overflow"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "refactor(type): tokenize home page font-sizes (#26)"
```

---

## Task 5: Pricing (`pricing.astro`)

**Files:**
- Modify: `src/pages/pricing.astro` (`<style>`, lines ~211–314)

- [ ] **Step 1: Desktop substitutions**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(40px,4.6vw,60px)` | `var(--text-display-compact)` |
| `.lede` | `18px` | `var(--text-lede)` |
| `.early` | `12px` | `var(--text-micro)` |
| `.calc-title` | `15px` | `var(--text-ui)` |
| `.calc-tag` | `10.5px` | `var(--text-nano)` |
| `.preset` | `12.5px` | `var(--text-caption)` |
| `.slider-top`, `.slider-top b` | `13px` | `var(--text-caption)` |
| `.calc-total-v` | `36px` | **keep** `/* readout */` |
| `.calc-total-l` | `13px` | `var(--text-caption)` |
| `.calc-line` | `13px` | `var(--text-caption)` |
| `.calc-cow` | `12px` | `var(--text-micro)` |
| `.section-title` | `clamp(28px,3.6vw,42px)` | `var(--text-h2)` |
| `.section-lede` | `17px` | `var(--text-body)` |
| `.rate-meter` | `15px` | `var(--text-ui)` |
| `.rate-val` | `17px` | `var(--text-body)` |
| `.rate-unit` | `12.5px` | `var(--text-caption)` |
| `.rate-note` | `12px` | `var(--text-micro)` |
| `.cmp-table` | `14px` | `var(--text-dense)` |
| `.cmp-table thead th` | `12px` | `var(--text-micro)` |
| `.cmp-own-h span` | `10px` | `var(--text-nano)` |
| `.cmp-own` | `15px` | `var(--text-ui)` |
| `.cmp-extra` | `14.5px` | `var(--text-ui)` |
| `.trust h3` | `15px` | `var(--text-ui)` |
| `.trust p` | `13.5px` | `var(--text-caption)` |
| `.faq-item summary` | `16px` | `var(--text-body)` |
| `.faq-item summary::after` | `18px` | `var(--text-title)` |
| `.faq-item p` | `14.5px` | `var(--text-ui)` |
| `.final-cta h2` | `clamp(30px,5vw,50px)` | `var(--text-cta)` |

- [ ] **Step 2: Mobile/tablet overrides**

| Selector | From | To |
|---|---|---|
| `.hero h1` (tablet) | `clamp(38px,8vw,52px)` | **keep** `/* compact-hero exception */` |
| `.hero h1` (mobile) | `clamp(30px,8.4vw,46px)` | **keep** `/* compact-hero exception */` |
| `.section-title` (mobile) | `clamp(24px,7vw,32px)` | `var(--text-h2-sm)` |
| `.cmp-table` (mobile) | `12.5px` | `var(--text-caption)` |
| `.calc-total-v` (mobile) | `30px` | **keep** `/* readout */` |

- [ ] **Step 3: Verify**

```bash
grep -n "font-size" src/pages/pricing.astro | grep -vE "var\(--text|/\* readout|/\* compact"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/pricing.astro
git commit -m "refactor(type): tokenize pricing font-sizes (#26)"
```

---

## Task 6: Benchmarks (`benchmarks.astro`)

**Files:**
- Modify: `src/pages/benchmarks.astro` (`<style>`, lines ~164–253)

- [ ] **Step 1: Desktop substitutions**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.stat-v` | `clamp(28px,4vw,40px)` | **keep** `/* readout */` |
| `.stat-l` | `14px` | `var(--text-dense)` |
| `.stat-s` | `12px` | `var(--text-micro)` |
| `.section-title` | `clamp(28px,3.6vw,42px)` | `var(--text-h2)` |
| `.section-lede` | `17px` | `var(--text-body)` |
| `.rate-note` | `12px` | `var(--text-micro)` |
| `.ref` | `12px` | `var(--text-micro)` |
| `.bench-table` | `14px` | `var(--text-dense)` |
| `.bench-table thead th` | `12px` | `var(--text-micro)` |
| `.bench-table .val` | `15px` | `var(--text-ui)` |
| `.bench-table .note` | `13px` | `var(--text-caption)` |
| `.copy-btn` | `11px` | `var(--text-nano)` |
| `.terminal-body` | `12.5px` | `var(--text-code-block)` |
| `.caveats li` | `15px` | `var(--text-ui)` |
| `.vbar-name` | `14px` | `var(--text-dense)` |
| `.vbar-op` | `11px` | `var(--text-nano)` |
| `.vbar-fig` | `13px` | `var(--text-caption)` |
| `.final-cta h2` | `clamp(28px,4.6vw,46px)` | `var(--text-cta)` |

- [ ] **Step 2: Mobile overrides**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |
| `.section-title` | `clamp(24px,7vw,32px)` | `var(--text-h2-sm)` |
| `.vbar-name` | `13px` | `var(--text-caption)` |
| `.vbar-op` | `10px` | `var(--text-nano)` |
| `.vbar-fig` | `12px` | `var(--text-micro)` |

- [ ] **Step 3: Verify**

```bash
grep -n "font-size" src/pages/benchmarks.astro | grep -vE "var\(--text|/\* readout"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/benchmarks.astro
git commit -m "refactor(type): tokenize benchmarks font-sizes (#26)"
```

---

## Task 7: Alternatives (`alternatives.astro`)

**Files:**
- Modify: `src/pages/alternatives.astro` (`<style>`, lines ~263–331)

- [ ] **Step 1: Substitutions**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.crit-n` | `13px` | `var(--text-caption)` |
| `.crit-body h3` | `19px` | `var(--text-title)` |
| `.crit-body p` | `15.5px` | `var(--text-ui)` |
| `.comp-table` | `14px` | `var(--text-dense)` |
| `.comp-table thead th` | `12px` | `var(--text-micro)` |
| `.cmp-card-h` | `17px` | `var(--text-title)` |
| `.cmp-card-win` | `14.5px` | `var(--text-ui)` |
| `.cmp-card-win .win-k` | `11px` | `var(--text-nano)` |
| `.cmp-card-context` | `13px` | `var(--text-caption)` |
| `.cmp-card-cta` | `12.5px` | `var(--text-caption)` |
| `.honest-inner p` | `16px` | `var(--text-body)` |
| `.faq-item summary` | `16px` | `var(--text-body)` |
| `.faq-item summary::after` | `18px` | `var(--text-title)` |
| `.faq-item p` | `14.5px` | `var(--text-ui)` |
| `.final-cta h2` | `clamp(30px,5vw,52px)` | `var(--text-cta)` |
| `.hero h1` (mobile) | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |

- [ ] **Step 2: Verify**

```bash
grep -n "font-size" src/pages/alternatives.astro | grep -vE "var\(--text"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 3: Commit**

```bash
git add src/pages/alternatives.astro
git commit -m "refactor(type): tokenize alternatives font-sizes (#26)"
```

---

## Task 8: Compare (`compare/[slug].astro`)

**Files:**
- Modify: `src/pages/compare/[slug].astro` (`<style>`, lines ~173–247)

- [ ] **Step 1: Substitutions**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.verdict-tag` | `12px` | `var(--text-micro)` |
| `.verdict p` | `16px` | `var(--text-body)` |
| `.comp-table` | `14px` | `var(--text-dense)` |
| `.comp-table thead th` | `12px` | `var(--text-micro)` |
| `.comp-table .mk` | `15px` | `var(--text-ui)` |
| `.comp-table .ct` | `11px` | `var(--text-nano)` |
| `.diff h3` | `18px` | `var(--text-title)` |
| `.diff p` | `14.5px` | `var(--text-ui)` |
| `.win-list li` | `15.5px` | `var(--text-ui)` |
| `.faq-item summary` | `16px` | `var(--text-body)` |
| `.faq-item summary::after` | `18px` | `var(--text-title)` |
| `.faq-item p` | `14.5px` | `var(--text-ui)` |
| `.more-name` | `15px` | `var(--text-ui)` |
| `.more-blurb` | `13px` | `var(--text-caption)` |
| `.final-cta h2` | `clamp(30px,5vw,52px)` | `var(--text-cta)` |
| `.hero h1` (mobile) | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |

- [ ] **Step 2: Verify**

```bash
grep -n "font-size" src/pages/compare/\[slug\].astro | grep -vE "var\(--text"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/compare/[slug].astro"
git commit -m "refactor(type): tokenize compare page font-sizes (#26)"
```

---

## Task 9: About + Contact

**Files:**
- Modify: `src/pages/about.astro`, `src/pages/contact.astro`

- [ ] **Step 1: `about.astro`**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.prose p` | `17px` | `var(--text-body)` |
| `.prose h2` | `clamp(22px,2.6vw,28px)` | `var(--text-h3)` |
| `.hero h1` (mobile) | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |

- [ ] **Step 2: `contact.astro`**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.intro p` | `17px` | `var(--text-body)` |
| `.contact-card h2` | `18px` | `var(--text-title)` |
| `.contact-card p` | `15px` | `var(--text-ui)` |
| `.hero h1` (mobile) | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |

- [ ] **Step 3: Verify**

```bash
grep -n "font-size" src/pages/about.astro src/pages/contact.astro | grep -vE "var\(--text"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/pages/contact.astro
git commit -m "refactor(type): tokenize about + contact font-sizes (#26)"
```

---

## Task 10: Blog (`blog/index.astro`, `blog/[slug].astro`)

**Files:**
- Modify: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`

- [ ] **Step 1: `blog/index.astro`**

| Selector | From | To |
|---|---|---|
| `.hero h1` | `clamp(46px,6vw,76px)` | `var(--text-display)` |
| `.lede` | `19px` | `var(--text-lede)` |
| `.rss-link` | `13px` | `var(--text-caption)` |
| `.post-cat` | `12px` | `var(--text-micro)` |
| `.post-title` | `clamp(20px,2.6vw,26px)` | `var(--text-h3)` |
| `.post-desc` | `15.5px` | `var(--text-ui)` |
| `.post-meta` | `12.5px` | `var(--text-caption)` |
| `.post-cta` | `12.5px` | `var(--text-caption)` |
| `.changelog p` | `15px` | `var(--text-ui)` |
| `.hero h1` (mobile) | `clamp(30px,8.4vw,48px)` | `var(--text-display-sm)` |

- [ ] **Step 2: `blog/[slug].astro`**

| Selector | From | To |
|---|---|---|
| `.back` | `13px` | `var(--text-caption)` |
| `.art-cat` | `12px` | `var(--text-micro)` |
| `.byline` | `13px` | `var(--text-caption)` |
| `.toc-h` | `12px` | `var(--text-micro)` |
| `.toc li::before` | `11px` | `var(--text-nano)` |
| `.toc a` | `14px` | `var(--text-dense)` |
| `.prose :global(p)` | `17px` | `var(--text-body)` |
| `.prose :global(h2)` | `clamp(22px,2.6vw,28px)` | `var(--text-h3)` |
| `.prose :global(ul)`, `.prose :global(ol)` | `17px` | `var(--text-body)` |
| `.prose :global(:not(pre) > code)` | `13.5px` | `var(--text-code)` |
| `.prose :global(table)` | `14px` | `var(--text-dense)` |
| `.prose :global(thead th)` | `12px` | `var(--text-micro)` |
| `.post-faq-h` | `clamp(20px,2.6vw,26px)` | `var(--text-h3)` |
| `.faq-item summary` | `16px` | `var(--text-body)` |
| `.faq-item summary::after` | `18px` | `var(--text-title)` |
| `.faq-item p` | `14.5px` | `var(--text-ui)` |
| `.tag` | `12px` | `var(--text-micro)` |
| `.rel-h` | `clamp(20px,2.6vw,26px)` | `var(--text-h3)` |
| `.rel-cat` | `11px` | `var(--text-nano)` |
| `.rel-title` | `16px` | `var(--text-body)` |
| `.rel-desc` | `14px` | `var(--text-dense)` |
| `.rel-meta` | `12px` | `var(--text-micro)` |

> Note: this page renders Markdown article prose. The `:global(...)` selectors must
> keep their `:global()` wrapper — only the `font-size` value changes.

- [ ] **Step 3: Verify**

```bash
grep -n "font-size" src/pages/blog/index.astro src/pages/blog/\[slug\].astro | grep -vE "var\(--text"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/index.astro "src/pages/blog/[slug].astro"
git commit -m "refactor(type): tokenize blog font-sizes (#26)"
```

---

## Task 11: Legal pages + 404

**Files:**
- Modify: `src/pages/privacy.astro`, `src/pages/terms.astro`, `src/pages/cookie-policy.astro`, `src/pages/404.astro`

- [ ] **Step 1: `privacy.astro`, `terms.astro` (identical patterns)**

| Selector | From | To |
|---|---|---|
| `.updated` | `13px` | `var(--text-caption)` |
| `.prose p` | `16px` | `var(--text-body)` |
| `.prose ul` | `16px` | `var(--text-body)` |
| `.prose h2` | `clamp(20px,2.4vw,26px)` | `var(--text-h3)` |

- [ ] **Step 2: `cookie-policy.astro`** (same as above, plus:)

| Selector | From | To |
|---|---|---|
| `.updated` | `13px` | `var(--text-caption)` |
| `.prose p` | `16px` | `var(--text-body)` |
| `.prose ul` | `16px` | `var(--text-body)` |
| `.prose h2` | `clamp(20px,2.4vw,26px)` | `var(--text-h3)` |
| `.prose .note` | `13px` | `var(--text-caption)` |
| `table` | `13.5px` | `var(--text-caption)` |
| `tbody code` | `12px` | `var(--text-micro)` |

- [ ] **Step 3: `404.astro`**

| Selector | From | To |
|---|---|---|
| `.nf-code` | `clamp(64px,12vw,132px)` | **keep** `/* unique glyph */` |
| `.nf h1` | `clamp(28px,4.4vw,46px)` | `var(--text-h2)` |
| `.nf .lede` | `18px` | `var(--text-lede)` |
| `.nf-links a` | `14px` | `var(--text-dense)` |

- [ ] **Step 4: Verify**

```bash
grep -n "font-size" src/pages/privacy.astro src/pages/terms.astro src/pages/cookie-policy.astro src/pages/404.astro | grep -vE "var\(--text|/\* unique glyph"
npm run build
```
Expected: grep prints nothing; build passes.

- [ ] **Step 5: Commit**

```bash
git add src/pages/privacy.astro src/pages/terms.astro src/pages/cookie-policy.astro src/pages/404.astro
git commit -m "refactor(type): tokenize legal pages + 404 font-sizes (#26)"
```

---

## Task 12: Final guard, build, and visual re-check

**Files:** none (verification only)

- [ ] **Step 1: Site-wide grep guard**

```bash
grep -rn "font-size" src/ \
  | grep -vE "var\(--text|og-template|/\* SVG|/\* readout|/\* overflow|/\* compact|/\* unique glyph|23px" \
  | grep -v "fan-"
echo "--- (expect: nothing above) ---"
grep -rn "step-" src/ ; echo "--- (expect: nothing above) ---"
```
Expected: both greps print nothing. (`og-template.astro` is the only file with un-tokenized sizes by design; the commented exceptions are the named literals.)

- [ ] **Step 2: Full production build**

```bash
npm run build
```
Expected: completes, no errors.

- [ ] **Step 3: Visual re-check at breakpoints**

```bash
npm run preview
```
Open each page at **390 / 768 / 1280** widths and confirm no overflow / broken rhythm. Focus areas:
- Home hero + division block (the overflow-tuned `21px`/`11.5px` literals).
- Pricing calculator + the compact hero across its three breakpoints.
- Consent banner (bottom of any page).
- Tables with `min-width` (comp/bench/cmp) — horizontal scroll, not layout break.
- A blog article (long-form prose at `--text-body`/`--text-h3`).
- Legal page prose (body nudged 16→17).

If anything reads visibly off (beyond a sub-pixel snap), note it and adjust the
offending token mapping — do not introduce a new ad-hoc `px` value.

- [ ] **Step 4: Final commit (if Step 3 required adjustments)**

```bash
git add -A
git commit -m "fix(type): breakpoint adjustments after type-scale sweep (#26)"
```

---

## Notes on dropped / kept literals (do not "fix" these)

- `og-template.astro` — OG image canvas, excluded entirely.
- `.nf-code` (404) — unique giant glyph.
- Numeric readouts: `stat-v`, `calc-total-v` (36/30), `division-stats .sv` (24/20).
- SVG `text`: `.fan-*`, `.parent-label`.
- Hand-tuned mobile/overflow: `.nav-menu-links a` 23px, `.division-h` mobile 21px,
  `.code-panel` mobile 11.5px, pricing hero mobile/tablet clamps.
