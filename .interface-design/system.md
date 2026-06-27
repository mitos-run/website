# Design System: mitos "Fluorescence"

Source of truth for tokens: `src/styles/tokens.css`. Prose rationale:
`docs/brand/brand-book.md`. This file is the enforceable mirror used by `/audit` and
`/critique`; flag any code that violates the rules below.

## Direction

A live-cell fluorescence microscope at 2am. True-black field; only measured signal
emits light. **Magenta-dominant** on near-black, with cyan as the steady secondary.
Instrumentation-grade precision, not "dark SaaS dashboard." Someone reading only these
tokens should picture a confocal microscope, not a template.

## Tokens (names + values, must match tokens.css)

Field / surfaces (elevation = lightness ladder, never shadow):
- `--field` #04050A · `--field-1` #0A0C12 · `--field-2` #11141C
- `--hairline` rgba(255,255,255,.08) · `--hairline-strong` rgba(255,255,255,.14)

Ink (white at opacity, never gray hex):
- `--ink` rgba(236,240,250,.94) · `--ink-2` .62 · `--ink-3` .40

Signal channels (color = meaning only):
- `--magenta` #FF45C8, PRIMARY signature: division / spindle / fork
- `--cyan` #3DDCFF, secondary: genome / parent / steady "alive"
- `--green` #4DF0A0, live / ready (rationed)
- `--amber` #FFC24B, warning / winner (rationed)
- `--signal-core` #FFFFFF, white-hot core; cyan+magenta overlap

Type: `--sans` Satoshi · `--mono` Geist Mono · scale `--step--1`…`--step-6` (~1.25) ·
display weights 300/400 · `--track-display` -0.03em · `--lh-tight` 1.02 · `--lh-body` 1.5.

Space (8px): `--space-1`…`--space-10` = 4 8 12 16 24 32 48 64 96 128.
Radii: `--r-sm` 4 · `--r-md` 8 · `--r-lg` 12.
Motion: `--ease` cubic-bezier(.2,1,.2,1) · `--dur` 240ms. Layout: `--maxw` 1140px.

## Patterns

- Buttons: `.btn-primary` magenta fill + additive emission on hover; `.btn-ghost`
  hairline → magenta on hover. Imperative labels only.
- Terminal: `.terminal` + `.terminal-bar` (dots) + `.terminal-body`; output via
  `.t-fork` (magenta), `.t-ok` (green), `.t-dim` (ink-3).
- Comparison: `.cmp`, rule-divided, mitos wins in `.win` (magenta).
- Signature: `Division.astro`, magenta membrane + cyan-white genome core.
- Field: fixed `.field` layer = reticle (~2%) + sensor grain (~3.5%).

## Journey (experience is DNA)

- No dead ends: marketing, onboarding, first success, and billing form one path.
- Simple surface, depth one click down: broad coverage without surface complexity.
- Intent-shaped aha: each on-ramp seeds context and routes to tailored first success.

## Hard rules (flag violations)

1. Glow must be **additive, white-cored, layered** (`mix-blend-mode: screen`). Never a
   single flat neon ring. Never animate `box-shadow` blur.
2. **< 10%** of any frame lit at full intensity. Black dominates.
3. **Magenta only as emitted signal**: never gradient filler or decorative fill.
4. Color must encode a real entity (parent=cyan, division=magenta, alive=green).
5. Near-black field (#04050A), **never `#000`**. Elevation by lightness ladder, never
   drop-shadow. Never a hairline border AND a diffuse shadow on the same element.
6. Text is **white-at-opacity tiers**, never gray hex.
7. Fonts: **Satoshi + Geist Mono only.** Never Inter/Roboto/Arial/system or Space
   Grotesk. Never Geist Sans.
8. Radii tight (≤12px). No one-sided accent borders on cards. No three-identical-cards
   rows. No emoji bullets. No purple/indigo. No rainbow/jet colormaps.
9. Motion: transform/opacity only, reduced-motion honored.
10. Copy: imperative CTAs; no slop lexicon; no em/en dashes; numbers over adjectives.
