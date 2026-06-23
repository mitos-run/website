# Type-scale harmonization

**Issue:** [#26](https://github.com/mitos-run/website/issues/26) · Parent epic: #21
**Date:** 2026-06-23
**Status:** Approved (design)

## Problem

Pages grew incrementally (home, pricing, benchmarks, alternatives, compare, about,
contact, blog, legal, docs, footer, consent banner). `font-size` was set per
page/component, so the type scale drifted:

- **Body copy** uses 14 / 14.5 / 15 / 15.5 / 16 / 16.5 / 17px interchangeably.
- **Captions/meta** span 11 / 12 / 12.5 / 13 / 13.5px.
- **Section title** exists in two variants: `clamp(28px,3.6vw,42px)` weight 400
  (pages) vs the layout's `clamp(28px,4vw,40px)` weight 600.
- **In-prose `h2`** differs: marketing `clamp(22px,2.6vw,28px)` vs legal
  `clamp(20px,2.4vw,26px)`.
- **Mono/code** runs 11 / 11.5 / 12 / 12.5 / 13 / 13.5px.
- The `--step-*` modular tokens (1.25 ratio → 12.8 / 16 / 20 / 25 …) are barely
  used and their steps don't land on the design's real values (17, 19).

## Decisions

1. **Fidelity: preserve the look, dedupe only.** Pages render ~identically. The
   win is one token-driven system and no sub-pixel drift. Snaps of <1.5px are
   acceptable; no deliberate re-tuning of the scale.
2. **Token model: semantic role tokens.** Add named `--text-*` tokens that say
   what they're for. Every `font-size` becomes `var(--text-*)`. Retire the unused
   `--step--1 … --step-6`.
3. **Body cluster collapses to three tiers:** prose = 17, UI/card = 15,
   dense/table = 14.

## The canonical token set

Added to `src/styles/tokens.css`, replacing the `--step-*` block. The bracketed
note is the de-facto drift each token absorbs.

### Fluid (headings)

```css
/* ---- Type roles: every font-size references one of these ---- */
--text-display:         clamp(46px, 6vw, 76px);   /* hero H1 */
--text-display-sm:      clamp(30px, 8.4vw, 48px); /* hero H1, mobile override */
--text-display-compact: clamp(40px, 4.6vw, 60px); /* pricing hero (exception) + page-hero */
--text-h2:              clamp(28px, 3.6vw, 42px); /* section titles, home division headline */
--text-h2-sm:           clamp(24px, 7vw, 32px);   /* section titles, mobile */
--text-h3:              clamp(22px, 2.6vw, 28px); /* in-article h2, pillars, FAQ heads, card titles */
--text-cta:             clamp(30px, 5vw, 52px);   /* final-CTA headlines (sit between h2 and display) */
```

| Token | Absorbs |
|---|---|
| `--text-display` | `clamp(46px,6vw,76px)` across index/about/alternatives/benchmarks/blog/compare/contact |
| `--text-display-sm` | `clamp(30px,8.4vw,48px)` mobile hero overrides |
| `--text-display-compact` | pricing `clamp(40px,4.6vw,60px)` (preserved exception); layout `page-hero h1` `clamp(38px,5vw,60px)` → 40 |
| `--text-h2` | page `section-title` `clamp(28px,3.6vw,42px)`; layout's `clamp(28px,4vw,40px)`/weight-600 drift; `division-h` `clamp(28px,4vw,44px)` → 42 |
| `--text-h2-sm` | `section-title` mobile `clamp(24px,7vw,32px)` |
| `--text-h3` | marketing `prose h2` `clamp(22px,2.6vw,28px)`; legal `prose h2` `clamp(20px,2.4vw,26px)` → 22–28; `pillar h3` `clamp(21px,2.3vw,27px)`; blog `post-title`/`rel-h`/`post-faq-h` `clamp(20px,2.6vw,26px)`; `404 nf h1` `clamp(28px,4.4vw,46px)` → 28–42 |
| `--text-cta` | final-CTA headlines: index/alternatives/compare `clamp(30px,5vw,52px)`; pricing `clamp(30px,5vw,50px)` → 52; benchmarks `clamp(28px,4.6vw,46px)` → 30–52 |

### Fixed

```css
--text-lede:       19px; /* hero subheadline */
--text-title:      18px; /* card / sub-section titles */
--text-body:       17px; /* long-form prose + section ledes */
--text-ui:         15px; /* standard card & UI body */
--text-dense:      14px; /* tables, compact lists, nav, footer links */
--text-caption:    13px; /* captions, meta, notes */
--text-micro:      12px; /* eyebrows, table headers, fine print */
--text-nano:       11px; /* superscript, badges, ultra-fine labels */
--text-code:       13px; /* inline <code> */
--text-code-block: 12.5px; /* terminal / code panels (preserved exactly) */
```

| Token | px | Absorbs |
|---|---|---|
| `--text-lede` | 19 | hero ledes 19; pricing/404 lede 18 → 19 |
| `--text-title` | 18 | card / sub-section titles: the 17 / 18 / 19 cluster (`contact h2`, `compare diff h3` 18, `step h3` 18, `crit-body h3` 19, `cmp-card-h` 17, `brand` 17) |
| `--text-body` | 17 | prose body + section ledes: 17 / 16.5 / 16 (`prose p`, `section-lede`, `division-lede` 16.5, legal `prose p` 16, `pillar p` 16, `faq summary` 16, `honest-inner p` 16) |
| `--text-ui` | 15 | card/UI body: 15.5 / 15 / 14.5 (`step p` 14.5, `crit-body p` 15.5, `win-list` 15.5, `caveats` 15, `contact-card p` 15, `cmp-extra` 14.5, `faq p` 14.5) |
| `--text-dense` | 14 | tables (`cmp/comp/bench-table` 14), `nav-links`, `ghost-link`, footer links, `btn` 14, `uc-item p`/`hosted-item p` 14, `vbar-name` 14 |
| `--text-caption` | 13 | captions/meta: 13.5 / 13 / 12.5 (`updated`, `byline`, `post-meta` 12.5, `slider-top`, `calc-line`, `more-blurb`, `gh-star` 13, `cookie-text` 13, `trust p` 13.5) |
| `--text-micro` | 12 | eyebrows, table `thead th` (12, uppercase), `rate-note`/`early`/`stat-s` 12, `ref` 12, `tech-chip` 12, `surf-note` 12 |
| `--text-nano` | 11 | `cmp-own-h span` super 10, `copy-btn` 11, `vbar-op` 11, `tag` 12→? (see note), `cookie-eyebrow` 10.5 → 11, `win-k` 11, `rel-cat` 11 |
| `--text-code` | 13 | inline `:not(pre) > code` 13.5 → 13; `install-cmd` 13; `tab` 13 |
| `--text-code-block` | 12.5 | `code-block`, `terminal-body`, `.code-panel` 12.5 (preserved exactly; overflow-sensitive) |

### Line-heights

Add two named reading rhythms; apply only where the value already matches (no
re-tuning):

```css
--lh-prose: 1.7;  /* long-form article/legal body */
--lh-snug:  1.55; /* card/UI body */
```

Keep existing `--lh-tight: 1.02` (display) and `--lh-body: 1.5`.

## Scope: preserved, NOT harmonized

- **`src/pages/og-template.astro`** — 1200×630 OG **image** canvas (72 / 34 / 30 /
  16px). Not screen type. Excluded entirely.
- **`404` `.nf-code`** `clamp(64px,12vw,132px)` — unique giant glyph. Documented
  one-off; left as-is.
- **Pricing compact hero** — the one intentional hero exception
  (`--text-display-compact`).
- **Numeric data readouts** — `stat-v` `clamp(28px,4vw,40px)`, `calc-total-v` 36
  (mobile 30), `division-stats .sv` 24 (mobile 20). Figures preserved; they keep
  their own weight/letter-spacing and stay as literals with a `/* readout */`
  comment. These are data, not prose.
- **SVG `text` sizes** in the home division diagram (`fan-*` 13/14) — left as-is
  (SVG coordinate space, not document flow).
- **Hand-tuned mobile/overflow literals (kept, commented):**
  - `Site.astro` `.nav-menu-links a` 23px — mobile-menu tap target.
  - `index` `.division-h` mobile 21px — overflow-tuned headline (the page's
    `--text-h2` floors at 28 on mobile, too big here).
  - `index` `.code-panel` mobile 11.5px — overflow-tuned mono (code blocks are
    "preserved exactly").
  - Pricing hero mobile/tablet overrides `clamp(38px,8vw,52px)` /
    `clamp(30px,8.4vw,46px)` — the compact-hero exception's own breakpoints.
- **Redundant overrides removed:** `index` mobile `.pillar h3 { 22px }` — `--text-h3`
  already floors at 22px on mobile, so the override is a no-op once tokenized.

## Edge cases / notes

- **`trust p` 13.5** and **`post-desc` 15.5**: 13.5 → `--text-caption` (13);
  15.5 → `--text-ui` (15). Both within the <1.5px snap budget.
- **`tag` 12** (blog tag pill) → `--text-micro` (12), not nano.
- **`faq summary` 16** is body-weight clickable text → `--text-body` (17) would
  enlarge it 1px; acceptable, but verify the `+` affordance still aligns. If it
  looks heavy, `--text-ui` (15) is the fallback — decide visually during the pass.
- **`btn` 14 / `btn-lg` 15**: keep as `--text-dense` (14) and `--text-ui` (15).
- Eyebrow tokens carry their own `letter-spacing`/`text-transform` at the call
  site; the token only sets size.

## Execution order

1. `src/styles/tokens.css` — add `--text-*` and `--lh-*`; remove `--step-*`.
2. `src/styles/base.css` — `h1/h2/h3`, `.section-title`, `.section-lede` →
   tokens. (Currently `h1/h2/h3` use `--step-6/4/2`, which are being removed.)
3. Components: `Site.astro` (layout: btn, nav, page-hero, section-title, tables,
   code), `SiteFooter.astro`, `Analytics.astro` (consent banner), `GhStars.astro`,
   `Division.astro` (already uses `--step--1` → `--text-caption`).
4. Pages: `index`, `pricing`, `benchmarks`, `alternatives`, `compare/[slug]`,
   `about`, `contact`, `blog/index`, `blog/[slug]`, `privacy`, `terms`,
   `cookie-policy`, `404`.
5. Grep guard: `grep -rn "font-size" src/ | grep -vE "var\(--text|og-template|nf-code"`
   should return only the documented numeric-readout/SVG exceptions.

## Verification

- `npm run build` succeeds.
- Visual re-check at **390 / 768 / 1280** for overflow + rhythm — focus on:
  tables with `min-width`, the pricing calculator, the consent banner, the home
  hero/division, blog article prose.
- Legibility floor held: body ≥ 15px on primary reading surfaces; nothing new
  drops below the existing 11px floor.
- No `--step-*` references remain (`grep -rn "step-" src/`).

## Out of scope

- Restyling, color, spacing, or weight changes beyond what dedupe requires.
- Docs/Starlight blog theme internals (Expressive Code) — separate concern.
- Any change to `og-template.astro`.
