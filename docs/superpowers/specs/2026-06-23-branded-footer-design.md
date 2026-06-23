# Branded footer redesign

**Issue:** #24 · **Branch:** `brand/landing-redesign` · **Date:** 2026-06-23

## Goal

Redesign the marketing footer (currently inline in `src/layouts/Site.astro`) into a
proper, on-brand **full sitemap footer**, and bring the Starlight docs footer to parity
so there is no split-brain. Honest links only — no padded/vague columns, no dead routes.

## Research-backed constraints (2026 footer best practices)

- 4–6 **intent-based** columns, max. Concrete labels (Product / Developers / Company /
  Legal); avoid vague catch-alls ("Resources").
- Footer is a **quiet utility**, not a branding showcase — subtle mark + tagline only.
- Dev-tool/OSS: GitHub > social. Never embed live social feeds (perf trap).
- Legal is first-class: persistent Privacy / Terms / Cookie-settings access.
- A11y: semantic `<footer>` + `<nav aria-label>`, real `<h2>` column headings (skippable
  by screen readers — currently `<p>`), WCAG AA contrast, visible focus, DOM == visual order.
- Mobile: stack to one column, accordion link groups, ≥44px targets, safe-area insets.

Sources: Eleken (10 modern footer UX patterns 2026), UXPin, Optimal, Neue World.

## Architecture

Extract a shared **`src/components/SiteFooter.astro`** that owns the footer markup +
styles. Both consumers import it:

- `src/layouts/Site.astro` — replaces the inline `<footer>` block.
- `src/components/starlight/Footer.astro` — renders `<SiteFooter />` (then mounts the
  existing `<Analytics />`) so docs get the same branded footer instead of Starlight's
  default. Keep the consent-banner behavior intact.

The component takes a `stars` prop (GitHub star count) so both layouts can pass the value
they already fetch. It must not hard-fail when stars is absent.

## Information architecture (real pages only)

**Brand band (top, full width):** Division mark + `mitos`, tagline synced to the live
hero lede (*"Isolated, forkable computers for your agents."*). One hairline below. No
large motif. The OSS badge + GitHub stars are NOT here — they live in the bottom row to
avoid duplicating "Apache 2.0".

**Columns:**

| Product | Developers | Company | Legal |
|---|---|---|---|
| How it works (`/#how`) | Docs (`/quickstart`) | About (`/about`) | Privacy (`/privacy`) |
| Benchmarks (`/benchmarks`) | Quickstart (`/quickstart`) | Contact (`/contact`) | Cookie settings (button) |
| Pricing (`/pricing`) | Architecture (`/architecture`) | Alternatives (`/alternatives`) | License (GitHub LICENSE) |
| Comparison (`/#compare`) | GitHub (repo) | Changelog (GitHub releases) | Security (GitHub SECURITY.md) |

**Bottom row:** `© 2026 mitos · Open source, Apache 2.0` left; right side carries the live
GitHub stars button + a `Back to top ↑` link. Cookie settings is a real `openCookieSettings`
button living in the Legal column.

## Decisions (locked with user)

1. **Link only what's real now.** Terms + Cookie-policy pages don't exist yet (tracked in
   legal issue #25). Add them to the Legal column when #25 lands. No placeholder stubs.
2. **No newsletter / early-access capture** — hosted console not live, no list/lifecycle infra.
3. **GitHub-only social.** X/Discord added later when real.

## Mobile + a11y

- Grid: 4 cols → 2 (≤900px) → 1 (≤460px). Link groups become `<details>` accordions ≤460px.
- `<footer>` wrapper; each column wrapped in `<nav aria-label="…">`; headings become `<h2>`.
- Visible `:focus-visible` rings; verify `--ink-2` link color meets AA on `--field-1` bg.

## Out of scope

- Legal page creation (#25), 404 (#28), font-size harmonisation (#26).
- Newsletter infra, social channels that don't exist.
