# mitos — "Fluorescence" Brand Book & Design System (design spec)

Date: 2026-06-22
Status: design approved; pending spec review → implementation plan
Supersedes: the light/emerald "Stripe-grade" direction on `brand/landing-redesign` (commits `e984dba`…`e117090`)
Builds on: `docs/brand/2026-06-21-brand-and-landing-research.md` (strategy) and the four 2026-06-22 anti-slop / craft / microscopy / skills research streams (summarized in §10)

---

## 1. Goal & scope

Produce a **complete, enforceable brand book + design-token system** for mitos, in the **dark "Fluorescence"** identity, and then rebuild the landing page on top of it. The work is **system-first**: author the canonical token layer and the brand book, then rebuild `index.astro` to consume tokens only.

**"Fully complete" + "non-AI-slop" is the governing constraint.** Completeness without craft slides into generic; the antidote is that every decision is grounded in evidence (real microscopy color-logic, named anti-slop discourse) and justified against the brief, not reached for as a default.

In scope (v1 = **full brand book**):
1. Foundation (positioning, metaphor, audience) — carried from strategy doc, not re-litigated
2. Logo & mark usage (favicon set, on-dark / on-light, clearspace)
3. Color system (palette, channel logic, glow rules, rationing)
4. Typography (Satoshi + Geist Mono, scale, weights, tracking)
5. Spacing & layout (scale, reticle field, density, radii)
6. Motion (principles, reduced-motion)
7. "The Division" — the signature animation spec
8. Voice & verbal identity (owned vocabulary + anti-slop copy rules)
9. Component patterns (buttons, nav, code/terminal, comparison table, pricing, cards)
10. OG / social image system
11. Accessibility (contrast floors, colorblind-safety, reduced-motion, focus)
12. Consolidated anti-slop guardrails

Out of scope: in-product console/dashboard UI (future, owned by `interface-design`); docs-page redesign beyond inheriting tokens; blog/changelog system (tracked separately).

## 2. Locked decisions (from brainstorming)

| Decision | Choice | Notes |
|---|---|---|
| Direction | **Dark Fluorescence** | near-black microscope field; supersedes light/emerald |
| Sequencing | **System first**, then rebuild page | tokens + brand book → page |
| Completeness | **Full brand book** (all 12 sections) | comprehensive |
| Sans typeface | **Satoshi** (display + body) | Geist Mono retained for code/data |
| Signature color relationship | **Magenta-dominant** | magenta `#FF45C8` = brand signature; cyan = steady secondary "alive" channel |
| Skills | install `frontend-design`; use `interface-design` for tokens; `marketing-skills` for copy | `frontend-design` installed to `~/.claude/skills/frontend-design/` |

### The central tension this design resolves
Two independent research streams flagged that **"cyan-on-dark with glowing shadows" is itself a recognized 2026 AI-slop tell**, and `frontend-design`'s own avoid-list names "near-black + a single bright acid accent" as a default to avoid. Fluorescence lives *adjacent to* that slop zone. The resolution, applied throughout this spec:
- **Magenta-dominant**, not cyan — magenta is the rarest, most ownable color in the category and is *insider-correct* (real microscopy recolors red channels to magenta for colorblind-safety).
- **Every glow is diegetic** — justified by the fluorescence-microscope metaphor and bound to a real entity/number, never decoration.
- **Physically-correct emission** — additive compositing, white-hot cores, layered bloom; never a flat neon ring.
- **Instrument texture** — sensor grain + a focus-reticle field motif, replacing the generic dot-grid.

Done with this discipline, a discerning engineer reads "confocal microscope," not "default dark template."

---

## 3. Color system

### 3.1 Field (the canvas)
True near-black. Only signal emits light. Elevation is a **lightness ladder**, never a drop-shadow (shadows barely read on dark).

| Token | Value | Role |
|---|---|---|
| `--field` | `#04050A` | base canvas (the void). Never `#000` (halation) |
| `--field-1` | `#0A0C12` | raised panel / card |
| `--field-2` | `#11141C` | raised +2 (popover, inset) |
| `--hairline` | `rgba(255,255,255,.08)` | default border, rides the ladder as white-alpha |
| `--hairline-strong` | `rgba(255,255,255,.14)` | emphasized border |

### 3.2 Ink (text) — white at opacity, never gray hex
White-at-opacity auto-adapts across elevation and reads as engineered.

| Token | Value | Role |
|---|---|---|
| `--ink` | `rgba(236,240,250,.94)` | primary text (faint cool tint) |
| `--ink-2` | `rgba(236,240,250,.62)` | secondary |
| `--ink-3` | `rgba(236,240,250,.40)` | muted / disabled |

### 3.3 Signal channels (the rationed color)
Color may only appear because it encodes a real entity. Two channels do the work; green/amber are tertiary states.

| Token | Value | Encodes |
|---|---|---|
| `--magenta` (primary signature) | `#FF45C8` | the division event / spindle / the fork — brand color: logo, nav, primary CTA |
| `--cyan` (secondary) | `#3DDCFF` | the genome / parent / steady "alive" signal |
| `--green` (tertiary) | `#4DF0A0` | "live / ready" state — sparing |
| `--amber` (tertiary) | `#FFC24B` | warning / the "winner" highlight — rationed |
| `--signal-core` | `#FFFFFF` | the white-hot core of any emission; also the cyan+magenta overlap |

### 3.4 The four governing rules (these are what dodge the slop tell)
1. **Additive, white-cored glow.** Emission cores clip toward white; the channel hue lives only in the falloff. Build glow as 3 layered shadows (tight `0 0 4px`/.9 → mid `0 0 16px`/.4 → ambient `0 0 48px`/.15) in the channel color, composited with `mix-blend-mode: screen` (or `plus-lighter`). Never a single flat neon ring. Use `filter: drop-shadow()` for non-rectangular/SVG signal. Animate via `transform`/`opacity` (promote layers), never animate `box-shadow` blur.
2. **< 10% of any frame is lit at full intensity.** Black dominates; signal is rare and precious. If squinting shows broad glow, dial down.
3. **Co-localization = white.** Where cyan and magenta signal overlap (the division instant), blend additively so the intersection brightens toward white — scientifically true and the basis of the signature device.
4. **Color = meaning only.** Channel colors never appear as gradient filler or decorative accents. Magenta especially is rationed to *emitted signal* so it reads "fluorescent stain," not "trendy pink."

### 3.5 Texture & field motif
- **Sensor grain:** ~2–4% opacity fractal-noise (`<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3">`, `filter: contrast(170%)`) over the field. Reads as a real detector readout and defeats dark-gradient banding.
- **Focus-reticle / graticule** alignment motif (calibration ticks / scan-lines) at 5–20% opacity, replacing the generic dot-grid. If the grid is the first thing you notice, it's too strong.

---

## 4. Typography

| Role | Face | Weights | Treatment |
|---|---|---|---|
| Display | **Satoshi** | 300 / 400 at large sizes (light reads expensive); 500 for emphasis | tracking `-0.03em`, leading ~1.0 on hero |
| Body | **Satoshi** | 400; 500 for UI labels | leading 1.5; tracking normal |
| Data / mono | **Geist Mono** | 400 / 500 | **tabular figures**; telemetry, labels, coordinates, the CLI readout |

- Type scale: modular ratio ~1.25, with **high weight contrast** (light display vs. medium UI), not adjacent weights.
- On dark, drop type weight one notch where it would feel heavy (light bleeds outward).
- Self-host both faces (Satoshi from Fontshare, Geist Mono) in `public/fonts/` with `@font-face`; `font-display: swap`; preload the hero display weight.
- **Never** Inter/Roboto/Arial/system, and **never** the "indie-safe" escapes (Space Grotesk, Instrument-serif-accent-word).

## 5. Spacing, layout, radii

- **8px base** spacing scale: `4 8 12 16 24 32 48 64 96 128`.
- **Deliberate asymmetric rhythm** — vary section spacing on purpose; monotonous even spacing reads templated.
- One repeated layout primitive, optically aligned to the reticle field. No mixing five card/section styles.
- **Radii:** tight and deliberate (`--r-sm: 4px`, `--r-md: 8px`, `--r-lg: 12px`); no fat `24px+` rounding, no rounded-on-rounded.
- **Depth model:** hairline border + (optional) faint lighter top-edge line for elevation. **Never** a hairline *and* a diffuse shadow on the same element.

## 6. Motion

- **Transform/opacity only**, GPU-composited, `< 500ms`, easing `cubic-bezier(.2,1,.2,1)`.
- `prefers-reduced-motion`: honor everywhere; the Division shows its final split statically.
- **One orchestrated moment** (the Division / a staggered page-load), not scattered micro-jitter. No bounce/elastic easing; no hover scale/rotate on images.

## 7. "The Division" — signature animation spec

The product's `fork()` rendered as mitosis; the aha and the brand are one image.

**States (single division):**
1. **Rest** — a luminous disc with a **cyan genome core** (white-hot center, cyan falloff) on the black field.
2. **Prophase** — the core elongates; faint **magenta spindle filaments** appear (thin luminous lines, not blobs).
3. **Separation (the hero frame)** — the disc pinches; at the pinch point cyan + magenta overlap → an **additive white-hot flash**; spindle peaks in magenta.
4. **Daughters** — two discs drift apart, each sharing a glowing core (CoW shared genome), each able to divide again.

**Properties:**
- Total ~600–800ms; **user-triggerable** ("Run `fork(8)`") and loops subtly; not scroll-gated (NN/g: scroll-gating primary content hurts B2B conversion).
- Pure SVG/Canvas, zero-dependency, CLS-safe; additive compositing (`globalCompositeOperation = 'lighter'` in canvas).
- **Scales fractally:** one division = the logo animation; eight chained = the hero swarm fan-out; a field = the OG/colony background.
- Encodes real metrics: daughters share the glowing core (CoW shared genome); only the dirtied edge lights uniquely (~3 MiB marginal cost).
- Reduced-motion → static final split (two daughters + one magenta flash frame).

## 8. Voice & verbal identity

**Tone:** precise, fast, quietly confident — a senior systems engineer who knows the biology and never overplays it. Biology supplies *verbs*, never adjectives.

**Owned vocabulary (four, used only where the mechanism literally maps):** fork / divide · colony / swarm · lineage · daughter / clone (+ genome for the shared CoW base). One bio word per idea, max.

**Anti-slop copy rules (never):**
- The `not just X, it's Y` / `it's not about X, it's about Y` construction (now regex-blocklisted as *the* AI tell).
- The slop lexicon: delve, leverage, unlock, unleash, empower, seamless, robust, harness, elevate, streamline, supercharge, world-class, game-changer, cutting-edge.
- Symmetric rule-of-three rhythm; unbenchmarked superlatives ("blazing fast"); `Simply…/Just…`; em-dash stacking; transition scaffolding (Furthermore/Moreover/Additionally); emoji headers; rhetorical-question openers.
- Latinate puff (utilize→use, facilitate→help, implement→build).

**Voice-craft rules (always):**
- **Prove, don't persuade** — every adjective becomes a number, unit, or mechanism.
- State the mechanism; let it *be* the benefit ("daughters share the parent's pages until they write").
- Have a falsifiable point of view; name the tradeoff honestly.
- Headlines: one concrete promise, verb + object/number. CTAs: imperative naming the real action ("Fork a sandbox," "Read the spec"), never "Get started / Learn more."
- Error messages: what went wrong + how to fix it, with the exact command; never blame the user.
- Vary sentence length; let one land short.

## 9. Component patterns

All consume tokens; no inline hex. Each documented in the brand book with the do/don't.

- **Buttons:** primary = magenta signal (white-cored emission on hover, not a flat fill glow); secondary = hairline ghost. No one-sided accent border. Imperative labels.
- **Nav:** quiet; brand mark in magenta; optional GitHub-star count (real, when available — never fabricated).
- **Code / terminal block:** the signature dev element. Geist Mono, copy button w/ "copied" confirmation, Shiki highlighting, tabbed package-manager switch where relevant, ANSI-correct terminal output colors, optional prompt glyph. The `mitos fork --count 8` readout is a hero artifact.
- **Comparison table:** honest, headline rows only; magenta marks the mitos column's wins; no fake competitor data.
- **Pricing:** 3–4 tiers, one "most popular," monthly/annual toggle with explicit savings, visible without a sales call.
- **Cards:** lightness-ladder surface + hairline; **never** three identical icon-cards-in-a-row; tile size encodes hierarchy if a grid is used.
- **Social proof:** hand-picked named quotes placed next to the relevant feature; no fake logos, no embedded feed.

## 10. OG / social image system

A **colony field** of chained divisions (fractal Division) on the black field with the magenta signature and the wordmark; per-page variants reuse the same generator. Built from the same SVG/Canvas primitive as the Division.

## 11. Accessibility

- Contrast floors: body text ≥ 4.5:1, large/bold ≥ 3:1, UI + focus rings ≥ 3:1 — verified against `--field` and `--field-1`.
- **Colorblind-safety is built into the palette** (magenta/green/cyan, not red/green).
- Visible keyboard focus (a magenta-or-cyan focus ring meeting 3:1); responsive to mobile; `prefers-reduced-motion` honored everywhere.
- Tabular figures for all numeric/telemetry data.

## 12. Consolidated anti-slop guardrails (the checklist)

**Never:** Inter/Roboto/Geist-sans/system fonts or Space-Grotesk escapes · purple/indigo anything · `#000` field · gray-hex text · flat neon ring glow · one-sided card accent border · hairline + shadow on same element · three identical feature cards · lazy uniform bento · tiny-uppercase-label-over-giant-H1 · `01/02/03` decoration · emoji bullets · bounce/elastic easing · rainbow/jet colormaps · DNA-helix / petri-dish / blob clip-art · the slop copy lexicon and `not-just-X-its-Y`.

**Always:** one signature (the Division) rationed brutally · magenta as emitted signal only · near-black + lightness-ladder elevation · white-alpha text tiers · additive white-cored layered glow · < 10% frame lit · sensor grain + reticle field · light display weights at large sizes · tight tracking + compressed leading · transform/opacity motion, reduced-motion respected · specificity & numbers over adjectives · one bio word where literally true.

---

## 13. System architecture (files)

```
src/styles/tokens.css        ← single source of truth: all CSS custom properties
                               (color, ink, signal, type, space, radii, motion, z)
src/styles/base.css          ← element defaults + @font-face, consuming tokens
src/layouts/Site.astro       ← imports tokens.css + base.css; global field/grain/reticle
public/fonts/                ← self-hosted Satoshi + Geist Mono
src/components/Division.astro ← the signature SVG/Canvas animation (fractal, reduced-motion)
.interface-design/system.md  ← human-readable, enforceable system (/audit, /critique)
docs/brand/brand-book.md     ← the full 12-section brand book (prose)
src/pages/index.astro        ← rebuilt to consume tokens only (no inline hex)
src/pages/pricing.astro,
src/pages/benchmarks.astro    ← inherit tokens
```

**Token layer is the contract.** Pages and components reference only CSS variables; the brand book is the prose source of truth; `system.md` is the machine-enforceable mirror used by `/audit` to stop defaults creeping back. Changing a brand decision = editing tokens + book + system.md together.

## 14. Build order (for the implementation plan)

1. **Tokens + fonts** — `tokens.css`, self-host Satoshi + Geist Mono, `base.css`, wire into `Site.astro`; field + grain + reticle. Verify on a throwaway page.
2. **Brand book + system.md** — author `docs/brand/brand-book.md` (12 sections) and `.interface-design/system.md` from the tokens.
3. **The Division** — `Division.astro` signature animation (single → fractal), reduced-motion fallback.
4. **Component patterns** — buttons, nav, code/terminal, comparison table, pricing, cards — to spec.
5. **Rebuild `index.astro`** on the system (magenta-dominant), then propagate to `pricing` / `benchmarks`.
6. **Copy pass** — `marketing-skills:copywriting` + `cro` against the anti-slop rules.
7. **OG system** + **a11y/`/audit` verification** + reduced-motion / contrast checks.

## 15. Open questions / risks

- **Magenta discipline.** The chosen magenta-dominant direction is the boldest break from the lock and the highest-risk for "trendy." Mitigation: magenta only as emitted, white-cored, rationed signal; verify against the slop checklist at every step; screenshot-critique.
- **Memory update.** `brand-direction-fluorescence.md` currently records "Division Cyan as the one rationed brand color" — now superseded by magenta-dominant. Update after spec sign-off.
- **Branch reconciliation.** This supersedes the light/emerald work on `brand/landing-redesign`. Decide at plan time whether to continue on this branch (overwriting) or branch fresh from `363950e`.
- **Satoshi licensing** for self-hosting (Fontshare ITF Free Font License) — confirm terms allow web self-host (expected yes).
