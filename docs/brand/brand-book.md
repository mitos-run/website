# mitos Brand Book — "Fluorescence"

The single source of truth for how mitos looks, moves, and speaks. Tokens live in
`src/styles/tokens.css`; this book explains them and the rules around them. When a
value here and a value in `tokens.css` disagree, `tokens.css` wins and this book is
wrong — fix it.

Direction in one line: **a live-cell fluorescence microscope at 2am.** True-black
field, luminous magenta signal, cyan genome, instrumentation-grade precision.

---

## 1. Foundation

**Product.** mitos runs managed Firecracker microVM sandboxes for AI agent swarms.
The signature primitive is a live copy-on-write fork of a running microVM into N
isolated daughters (~27 ms each, ~3 MiB marginal memory). Hosted SaaS plus an
Apache-2.0 open-source engine.

**The metaphor is the product.** "mitos" is mitosis. One living cell divides into N
identical daughters by copying itself — which is exactly what a CoW fork of a running
VM does. No competitor can credibly take this: it is true to the tech, it is in the
name, and it opens a visual and verbal world the rest of the category cannot enter.

**Positioning.** *One agent divides into a thousand.* Fork one running microVM into a
swarm of isolated subagents, each its own computer, alive in ~27 ms. Open source.
Fully managed. Division leads; ~27 ms is proof, not the headline; "run it yourself"
is the trust wedge.

**Audience #1.** AI agent engineers — people building agent products who buy on DX,
the fork primitive, real numbers, and trust. They prove, they don't get persuaded.

---

## 2. Logo & mark

The mark is a dividing cell: a filled disc separating into an open ring
(golden-ratio geometry). It is already frames one and two of the Division animation.

- On dark (default): the mark sits on the field with a faint magenta emission
  (`drop-shadow(0 0 6px magenta@60%)`).
- Clearspace: at least the height of the disc on all sides.
- Favicon / app icons: the existing set in `public/` (`favicon.svg`, `favicon-32`,
  `favicon-16`, `apple-touch-icon`, maskable 192/512). Theme color `#04050A`.
- Never recolor the mark outside the channel palette; never add a second accent.

---

## 3. Color

The field is true black; only signal emits light. Elevation is a lightness ladder,
never a drop-shadow.

| Token | Value | Role |
|---|---|---|
| `--field` | `#04050A` | base void (never `#000`) |
| `--field-1` | `#0A0C12` | raised panel / card |
| `--field-2` | `#11141C` | raised +2 (popover, inset) |
| `--hairline` | `rgba(255,255,255,.08)` | default border |
| `--hairline-strong` | `rgba(255,255,255,.14)` | emphasized border |
| `--ink` | `rgba(236,240,250,.94)` | primary text |
| `--ink-2` | `rgba(236,240,250,.62)` | secondary text |
| `--ink-3` | `rgba(236,240,250,.40)` | muted / disabled |
| `--magenta` | `#FF45C8` | **primary signature** — division / spindle / fork |
| `--cyan` | `#3DDCFF` | secondary — genome / parent / steady "alive" |
| `--green` | `#4DF0A0` | tertiary — live / ready |
| `--amber` | `#FFC24B` | tertiary — warning / winner |
| `--signal-core` | `#FFFFFF` | white-hot emission core; cyan+magenta overlap |

**Magenta is dominant.** It is the rarest, most ownable color in the agent-sandbox
category, and it is insider-correct: real microscopy recolors red channels to magenta
for colorblind safety. Cyan is the steady secondary. Green and amber are rationed.

**The four glow rules** (this is what keeps a dark-plus-accent look from reading as a
generic AI default):
1. Glow is additive and white-cored — cores clip toward white; the channel hue lives
   only in the falloff; layer it (tight → mid → ambient); composite with
   `mix-blend-mode: screen`. Never a flat neon ring.
2. Less than 10% of any frame is lit at full intensity. Black dominates.
3. Co-localization is white — where cyan and magenta overlap (the division instant),
   the intersection brightens toward white.
4. Color encodes a real entity only. Magenta especially appears only as emitted
   signal, never as gradient filler — so it reads "fluorescent stain," not "trendy."

**Text:** white at opacity, never gray hex — it auto-adapts across elevation.

**Contrast on `--field`:** ink 17.85:1, cyan 12.49:1, green 13.85:1, amber 12.67:1,
magenta 6.73:1 — all clear the WCAG floors (see §11).

---

## 4. Typography

| Role | Face | Notes |
|---|---|---|
| Display | **Satoshi** | weights 300/400 at large sizes (light reads expensive); tracking `-0.03em`; leading ~1.02 |
| Body | **Satoshi** | weight 400; leading 1.5 |
| Data / code | **Geist Mono** | tabular figures; telemetry, labels, the CLI readout |

Both are self-hosted in `public/fonts/` (`Satoshi-Variable.woff2`,
`GeistMono-Variable.woff2`) with `font-display: swap`; the hero weights are preloaded.

Type scale (`--step--1`…`--step-6`) is a ~1.25 modular scale with high weight contrast.
Never Inter / Roboto / Arial / system, and never the "indie-safe" escapes
(Space Grotesk, an Instrument-serif accent word in a sans headline). Geist *Mono*
stays; Geist *Sans* is gone (it is Vercel's font and undercuts the rebrand).

---

## 5. Spacing & layout

- 8px base scale: `--space-1`…`--space-10` (4 → 128px).
- Rhythm is deliberately asymmetric; monotonous even spacing reads templated.
- Radii are tight: `--r-sm 4`, `--r-md 8`, `--r-lg 12`. No fat 24px+ rounding,
  no rounded-on-rounded.
- Depth model: hairline border plus an optional faint lighter top edge. Never a
  hairline and a diffuse shadow on the same element.
- The field carries a faint focus-reticle / graticule (calibration lines at ~2%) and
  ~3.5% sensor grain — the cheapest escape from "every dark dev tool." Keep both near
  invisible; if the grid is the first thing you notice, it is too strong.

---

## 6. Motion

- Transform and opacity only; GPU-composited.
- UI transitions under 500ms with `--ease` (`cubic-bezier(.2,1,.2,1)`). The Division is
  the one orchestrated moment and may run ~1.2s.
- `prefers-reduced-motion` is honored everywhere; the Division shows its final split
  statically.
- No bounce/elastic easing; no hover scale or rotate on images; never animate
  `box-shadow` blur (animate transform/opacity instead).

---

## 7. The Division (signature element)

`fork()` rendered as mitosis — the aha and the brand are one image. Component:
`src/components/Division.astro`.

Each cell is a **magenta membrane** (the dominant brand signal) wrapping a
**cyan-white genome core** (the shared CoW base). States:
1. Rest — one luminous cell: white-hot core, cyan genome falloff, magenta membrane.
2. Prophase — the membrane elongates; a magenta spindle flares (thin luminous line).
3. Separation — the cell pinches; a white-hot flash at the split (cyan+magenta → white).
4. Daughters — two cells drift apart, each a cyan core in a magenta membrane, each
   able to divide again.

Built in SVG + CSS (`mix-blend-mode: screen` for the additive feel). ~1.2s,
user-triggerable ("Run fork(8)"), loops on demand, reduced-motion → static split.
Scales fractally: one division = the logo; eight chained = the hero swarm; a field =
the OG image. Encodes the real economics — daughters share the glowing core (shared
genome), only the divergent edge lights uniquely (~3 MiB marginal).

---

## 8. Voice & verbal identity

**Tone:** precise, fast, quietly confident — a senior systems engineer who knows the
biology and never overplays it. Biology supplies verbs, never adjectives.

**Owned vocabulary (four, used only where the mechanism literally maps):** fork /
divide · colony / swarm · lineage · daughter / clone (plus *genome* for the shared CoW
base). One biology word per idea, at most.

**Never:**
- The "not just X, it's Y" / "it's not about X, it's about Y" construction.
- The slop lexicon: delve, leverage, unlock, unleash, empower, seamless, robust,
  harness, elevate, streamline, supercharge, world-class, game-changer, cutting-edge.
- Symmetric rule-of-three rhythm; unbenchmarked superlatives ("blazing fast");
  "Simply…/Just…"; em-dash stacking; transition scaffolding (Furthermore, Moreover);
  emoji headers; rhetorical-question openers; em/en dashes in site copy.

**Always:**
- Prove, don't persuade — every adjective becomes a number, unit, or mechanism.
- State the mechanism and let it be the benefit ("daughters share the parent's pages
  until they write").
- Have a falsifiable point of view; name the tradeoff honestly.
- Headlines: one concrete promise (verb + object/number). CTAs: imperative naming the
  real action ("Fork a sandbox", "Read the spec"), never "Get started" / "Learn more".
- Error messages: what went wrong plus the exact fix command; never blame the user.
- Vary sentence length; let one land short.

---

## 9. Components

Defined in `src/layouts/Site.astro`; all consume tokens (no inline hex).

- **Buttons.** `.btn-primary` = magenta fill, field-colored text, additive emission on
  hover. `.btn-ghost` = hairline border, magenta on hover. Imperative labels only.
- **Nav.** Sticky, blurred field backdrop; brand mark with magenta emission; hairline
  appears on scroll.
- **Terminal / code.** `.terminal` chrome bar with traffic dots; `.terminal-body` in
  Geist Mono; signal-colored output (`.t-fork` magenta, `.t-ok` green, `.t-dim`
  ink-3). The `mitos fork --count 8` readout is a hero artifact.
- **Comparison table.** `.cmp`, rule-divided, headline rows only; the mitos column's
  wins marked `.win` in magenta. No fabricated competitor data.
- **Cards / pricing.** Built on the lightness ladder + hairline during the page work
  (plan 3). Never three identical icon-cards in a row; tile size encodes hierarchy.
- **Social proof.** Hand-picked named quotes beside the relevant feature; no fake
  logos, no embedded feed, no fabricated star counts.

---

## 10. OG / social

A colony field — chained Divisions (fractal) on the black field with the magenta
signature and the wordmark — generated from the same SVG primitive as the Division.
1200×630. Per-page variants reuse one generator.

---

## 11. Accessibility

- Contrast floors: body ≥ 4.5:1, large/bold ≥ 3:1, UI/focus ≥ 3:1. Measured on
  `--field`: ink 17.85, magenta 6.73, cyan 12.49, green 13.85, amber 12.67 — all pass.
- The palette is colorblind-safe by construction (magenta / green / cyan, not
  red / green).
- Visible keyboard focus: a magenta 2px ring (in `base.css`).
- Responsive to mobile; `prefers-reduced-motion` honored everywhere; tabular figures
  for all numeric data.

---

## 12. Anti-slop guardrails (the checklist)

**Never:** Inter / Roboto / Geist-sans / system fonts, or Space-Grotesk escapes ·
purple / indigo anything · `#000` field · gray-hex text · flat neon ring glow ·
one-sided card accent border · hairline + shadow on one element · three identical
feature cards · lazy uniform bento · tiny-uppercase-label over a giant H1 · 01/02/03
decoration · emoji bullets · bounce/elastic easing · rainbow/jet colormaps ·
DNA-helix / petri-dish / blob clip-art · the slop copy lexicon and "not-just-X-its-Y."

**Always:** one signature (the Division), rationed brutally · magenta as emitted
signal only · near-black plus lightness-ladder elevation · white-alpha text tiers ·
additive white-cored layered glow · under 10% of the frame lit · sensor grain plus
reticle field · light display weights at large sizes · tight tracking + compressed
leading · transform/opacity motion with reduced-motion respected · specificity and
numbers over adjectives · one biology word only where it is literally true.
