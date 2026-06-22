# mitos Brand & Interface Guide — "Fluorescence"

The canonical, practical guide for building any mitos surface so it matches the
landing page experience. Extracted from what actually shipped on `/`.

- **Tokens (source of truth):** `src/styles/tokens.css`. Reference `var(--*)`, never raw hex.
- **Base layer:** `src/styles/base.css` (fonts, the field, the glow utility, resets).
- **Enforceable mirror:** `.interface-design/system.md` (for `/audit`, `/critique`).
- **Reliable screenshots:** `node scripts/cdp-shot.mjs <width> out.png <url>` (headless `--window-size` renders at the wrong viewport; don't trust it).

If a value here disagrees with `tokens.css`, `tokens.css` wins — fix this doc.

---

## 1. The experience in one paragraph

A live-cell fluorescence microscope at 2am. A true-black field where **only signal
emits light**. One rationed, dominant **magenta** that means "division / the fork";
**cyan** as the steady "alive / genome" channel. Light, confident display type;
mono for anything you'd type or measure. Generous breathing room, left-aligned and
editorial, separated by space rather than lines. Copy that sounds like a senior
systems engineer: short, specific, falsifiable, never overcommunicated. One
signature device — the dividing cell — earns all the boldness; everything else is
quiet and disciplined.

---

## 2. Color

True near-black field; elevation is a **lightness ladder, never a drop-shadow**.

| Token | Value | Use |
|---|---|---|
| `--field` | `#04050A` | base canvas (never `#000` — halation) |
| `--field-1` | `#0A0C12` | raised panel / card |
| `--field-2` | `#11141C` | raised +2 (inset, code bg, popover) |
| `--hairline` | `rgba(255,255,255,.08)` | default border |
| `--hairline-strong` | `rgba(255,255,255,.14)` | emphasized border |
| `--mark-bg` | `#04050A` | the brand mark's ring-cut = the field |
| `--ink` / `--ink-2` / `--ink-3` | white @ `.94` / `.62` / `.40` | text tiers (white-at-opacity, **never** gray hex) |
| `--magenta` | `#FF45C8` | **primary signature** — division / fork / primary CTA / "wins" |
| `--cyan` | `#3DDCFF` | secondary — genome / "alive" / links-in-prose / inline highlights |
| `--green` | `#4DF0A0` | tertiary — "ok / ready" states (terminal `✓`), rationed |
| `--amber` | `#FFC24B` | tertiary — warnings / the gold GitHub star, rationed |
| `--signal-core` | `#FFFFFF` | white-hot emission core; cyan+magenta overlap |

**The four rules that keep dark+accent from reading as a generic AI default:**
1. **Glow is additive, white-cored, layered** — cores clip toward white, the hue
   lives in the falloff; layer 3 shadows (tight→mid→ambient); `mix-blend-mode: screen`.
   Never a flat neon ring. Never animate `box-shadow` blur (animate transform/opacity).
   The `.glow` utility (base.css) sets this; pass `--glow-color`.
2. **< 10% of any frame lit at full intensity.** Black dominates; signal is rare.
3. **Magenta is dominant but rationed** — it appears only as *emitted signal* (the
   fork, a CTA, a "win", the brand mark's faint emission). Never as gradient filler,
   never as a big pink block. This is what reads "lab," not "trendy."
4. **Color = meaning.** A channel appears only because it encodes a real thing
   (magenta=division, cyan=alive/genome, green=ready, amber=warn).

**Texture:** a fixed `.field` layer carries a faint reticle/graticule (~2% lines)
+ ~3.5% sensor grain. Near-invisible by design — the cheapest escape from "every
dark dev tool." A faint, diegetic magenta ambient bloom may sit behind a hero
(~12% color, low opacity) as "the specimen under illumination."

---

## 3. Typography

| Role | Face | Notes |
|---|---|---|
| Display + body | **Satoshi** (self-hosted) | weights **300/400 at large sizes** (light reads expensive); 500/600 for UI emphasis |
| Data / code / labels | **Geist Mono** (self-hosted) | tabular figures; telemetry, the CLI readout, stat numbers, the star count |

- Tokens: `--sans`, `--mono`, scale `--step--1`…`--step-6` (~1.25 ratio),
  `--track-display: -0.03em` (tight on display), `--lh-tight: 1.02`, `--lh-body: 1.5`.
- **Section titles + the hero H1 are weight 400** (light). Sub-headings (card titles,
  step titles) are 500. Heavy bold reads cheap; light-at-large reads premium.
- **Never** Inter / Roboto / system fonts, and never the "indie-safe" escapes
  (Space Grotesk, an Instrument-serif accent word in a sans headline). Geist *Mono*
  stays; Geist *Sans* is gone (it's Vercel's font).
- Mono numerals = "real readout." Use tabular figures wherever numbers appear.

---

## 4. Layout & spacing system

- **Container:** `max-width: 1140px`, centered, **`padding-inline`** only (never the
  `padding` shorthand — it zeroes section vertical padding on `section.container`).
- **Section rhythm:** generous and even. Set vertical padding with **`padding-block`**
  (~100px desktop, ~64px mobile). Sections separate by **space, not rules** — we
  removed horizontal section/gallery/step dividers; rely on the breathing room.
  **Vertical** column dividers inside galleries are kept.
- **Alignment rule:** **left by default** (confident, editorial). Center only two
  things — the **signature** (the Division) and the **closing CTA**.
- **Line length:** body/lede `max-width` ~42em; hero lede ~24em. Don't run wide.
- **Spacing scale (8px):** `--space-1…10` = 4 8 12 16 24 32 48 64 96 128. Vary
  section rhythm deliberately; monotonous even spacing reads templated.
- **Radii:** tight — `--r-sm 4`, `--r-md 8`, `--r-lg 12`. No fat 24px+ rounding.
- **Depth:** hairline border (optionally + a faint lighter top edge). **Never** a
  hairline *and* a diffuse shadow on the same element.

---

## 5. Components (as shipped)

**Buttons.** `.btn-primary` = magenta fill, field-colored text; hover adds an
*additive emission* (layered magenta shadow), not a flat glow. `.btn-ghost` =
hairline border, goes magenta on hover. Imperative labels only ("Start swarming",
"Read the spec", "See pricing") — never "Get started / Learn more".

**Nav.** Sticky, blurred field backdrop (`rgba(4,5,10,.55)` + blur), a hairline
appears on scroll. Brand mark carries a faint magenta drop-shadow emission. Right
side: the **star counter** + the primary CTA.

**Mobile menu (hamburger).** Below 900px the links collapse into a hamburger that
opens a **full-screen overlay** on the solid field (large tap targets, hairline
dividers, the star pill at the bottom); the primary CTA stays visible in the bar.
Toggle via a **`display: none/flex` class** (not opacity — see Motion caveat).
Accessible: `aria-expanded`/`aria-controls`/`aria-hidden`, Esc to close, closes on
link tap and on resize past 900px, body scroll-locked while open.

**GitHub star counter.** A pill: GitHub mark + **gold ★** + count. Count is baked at
build time (`src/lib/stars.ts`, cached once per build, `GITHUB_TOKEN`-aware,
graceful fallback) and refreshed live client-side (cached 1h in localStorage).
Format `>=1000` as `k`. Show the real number, however small — honesty over vanity.
Lives in nav, mobile menu, footer. Component: `src/components/GhStars.astro`.

**Code card (hero).** Three stacked elements: an **install box** (`$ ` prefix in
magenta, copy button) → a **tab bar with real language logos** (Python/TS/CLI/MCP)
→ a **syntax-highlighted code panel**. Syntax maps to signal colors — strings green,
keywords cyan-ish, comments ink-3, and **`fork` in magenta** (the brand verb in the
code). The panel has a **fixed height** so switching tabs never resizes the card;
the column uses `minmax(0, …)` + `min-width: 0` so long lines scroll instead of
widening it.

**Terminal block.** Chrome bar with traffic dots; Geist Mono body; signal-colored
output (`.t-fork` magenta, `.t-ok` green, `.t-dim` ink-3).

**Comparison table.** Rule-divided (hairline rows), headline rows only, honest and
falsifiable (concede what's true; partial = `◐` with a note). The **mitos column's
wins are magenta**. Notes sit as small captions **under** each ✓/✗/◐, cells
**top-aligned**, so marks form a clean grid both directions. On mobile the first
(Capability) column is **pinned sticky and slimmed (~140px)** so 2 competitor
columns show while it scrolls. Never fabricate competitor data.

**Feature grids ("rule-divided galleries").** One shared language: top border +
**vertical column dividers** (`border-left`, none on the first column), padded
cells, no boxy bottom rules. Used for use-cases and the managed grid. The
numbered process ("how it works") is a deliberate variant: top-rule columns with
gaps + the `01/02/03` markers (numbering is allowed *because it's a real sequence*).

**Pillars (2-up trust blocks).** Two columns; reserve 2 lines for both headings so
the body aligns, and **pin each column's CTA to the bottom** so they read as an even
pair. Use for paired "trust" points (isolation + economics).

**FAQ.** Dividerless `<details>` accordion separated by spacing; magenta `+`/`−`
markers; question goes magenta on hover.

---

## 6. The Division (signature device)

`fork()` rendered as mitosis — the aha and the brand are one image. Each cell is a
**magenta membrane** (the dominant brand signal) around a **cyan-white genome core**
(the shared CoW base). It pinches, a magenta spindle flares, a **white-hot additive
flash** at separation (cyan+magenta → white), and two daughters drift apart, each
able to divide again. SVG + CSS; reduced-motion shows the final split.

It **scales fractally** and is the one place lavish motion is earned:
- one division = the logo / a compact accent (`src/components/Division.astro`),
- an **8-way fan** (one parent → eight daughters) = the desktop hero centerpiece,
- a field of them = the OG image.

**Mobile uses the single-cell version** (the wide fan is cramped on phones); the
"N-way swarm" message lives in the stats row. Plays on scroll-into-view; no replay
button needed.

---

## 7. Motion

- **transform/opacity only**, GPU-composited, UI transitions `< 500ms`, easing
  `--ease` = `cubic-bezier(.2,1,.2,1)`. The Division is the one orchestrated moment.
- `prefers-reduced-motion` honored everywhere (base.css forces near-instant).
- No bounce/elastic; no hover scale/rotate on images.
- **Build caveat:** the CSS optimizer can leave `animation` shorthands using
  `var(--ease)` stuck at the `from` opacity. For anything whose *visibility* depends
  on the end state (overlays, menus), use a **`display` toggle**, not an
  opacity/visibility animation. Decorative reveals are fine.

---

## 8. Voice & copy

**Tone:** precise, fast, quietly confident — a senior systems engineer who knows the
biology and never overplays it. Biology supplies verbs, never adjectives.

**Owned vocabulary (rationed):** fork / divide · colony / swarm · lineage ·
daughter / clone (+ *genome* for shared CoW pages). **Use "fork"** as the workhorse
in technical/scannable spots (tables, FAQ, code). Reserve **"daughter"** for the
Division metaphor only. One biology word per idea, max.

**Positioning (applies to all copy):**
- Position at the **fork / swarm primitive**, not "a secure sandbox" (that's the
  commoditized axis; you'd be compared on cold-start ms and lose).
- **Managed is the product; open source is a quiet *trust / no-lock-in* signal** —
  never "self-host is our offering," never a "save money by running it yourself" nudge.
- The honest moat is the **combination** (fastest/densest live CoW fork + honest
  economics + real Apache-2.0 exit, managed). **Do not** claim the fork is unique.

**Scannability (hard-won):** shorter beats complete. Headline + one short line.
Cut filler, cut restatements, cut a clause if it repeats a number already shown.
Don't put the same `~27ms / ~3 MiB` in five places.

**Never:** the `not-just-X-its-Y` construction · the slop lexicon (delve, leverage,
seamless, robust, empower, world-class, blazing, supercharge) · symmetric
rule-of-three · unbenchmarked superlatives · `Simply…/Just…` · transition
scaffolding (Furthermore/Moreover) · emoji headers · **em/en dashes** · stylized
interpunct inside identifiers (`vm·0` → `vm-0`).

**Always:** prove don't persuade (every adjective → a number/unit/mechanism) ·
state the mechanism and let it be the benefit · have a falsifiable point of view ·
name the tradeoff honestly · imperative CTAs naming the real action · error
messages give the exact fix command · vary sentence length, let one land short.

**Honesty (non-negotiable):** real numbers only (`~27 ms` warm-fork P50, `~3 MiB`
CoW marginal) · no fabricated logos, testimonials, or star counts · only claim
features that exist today (e.g. "hard spend caps" yes; not suspend-to-zero/SOC2
unless true) · if hosted signup isn't live, the CTA shouldn't imply it is.

---

## 9. Responsive system

- **Breakpoints:** 900px (stack grids, show hamburger, hide desktop nav links +
  star), 600px (phone tuning), 460px (footer to 1 column).
- **Hero:** big top padding desktop, much less on phones; headline scales via
  `clamp()` to fit one viewport without clipping (`overflow-x: hidden` clips, so size
  to fit). Heading forced `<br>`s are dropped on mobile + `text-wrap: pretty` so they
  flow without orphaned words.
- **Signature:** swap the wide fan for the single cell under 600px.
- **Tables:** pin + slim the label column; competitors scroll.
- **Verify at a true viewport** with `scripts/cdp-shot.mjs` — measure
  `documentElement.scrollWidth === innerWidth` (zero horizontal overflow is the bar).

---

## 10. Anti-slop checklist

**Never:** Inter/Roboto/system or Space-Grotesk fonts · purple/indigo · `#000` field ·
gray-hex text · flat neon-ring glow · one-sided card accent border · hairline +
shadow together · three identical icon-cards · tiny-uppercase-label over a giant H1 ·
`01/02/03` as decoration (only for real sequences) · emoji bullets · bounce easing ·
rainbow/jet colormaps · DNA-helix/petri-dish clip-art · the slop lexicon · em/en dashes.

**Always:** one signature (the Division) rationed hard · magenta as emitted signal
only · near-black + lightness-ladder elevation · white-alpha text · additive
white-cored glow · < 10% lit · grain + reticle field · light display weights · tight
tracking + compressed leading · transform/opacity motion, reduced-motion respected ·
left-aligned + space-separated · specificity & numbers over adjectives · honest
proof only.

---

## 11. How to build a new surface

1. Wrap in the `Site` layout (or import `tokens.css` + `base.css`) so you inherit the
   field, fonts, nav, footer, and tokens.
2. Build with `var(--*)` tokens only — no inline hex.
3. Reuse the components above (buttons, terminal, table, pillars, code card, star
   counter, the Division). Match the spacing/alignment rules in §4.
4. Write copy to §8 (managed-first, scannable, honest, fork-not-daughter).
5. Verify: `npm run build`, then `node scripts/cdp-shot.mjs 390 /tmp/m.png <url>` for
   mobile and a desktop width; confirm zero horizontal overflow and run `/audit`
   against `.interface-design/system.md`.
