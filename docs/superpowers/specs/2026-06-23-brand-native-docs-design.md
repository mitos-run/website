# Brand-native docs sourced live from the engine repo

**Date:** 2026-06-23
**Status:** Approved (design) — pending implementation plan

## Problem

The website's docs are two hand-written pages (`src/content/docs/quickstart.md`,
`architecture.md`) rendered in Starlight's stock theme. Two failures:

1. **Off-brand.** They render in Starlight's default chrome (fonts, blue accents,
   its own header/footer), so they read as a different site from the fluorescence
   landing page.
2. **Thin and already drifted.** The engine repo (`mitos-run/mitos`, public) ships
   ~40 accurate, well-written docs under `docs/`. The website surfaces none of them
   and the two it does maintain are wrong: the site's quickstart says
   `pip install mitos` / `npm i @mitos/sdk` / `AgentRun().sandbox(...)`, while the
   real `docs/quickstart.md` says `pip install mitos-run` / `import mitos` /
   `mitos.create("python")`.

The engine repo must be the **only** source of truth — its docs live on `main`, and
the website renders them live, never a hand-copied duplicate.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Source mechanism | Build-time fetch of `mitos-run/mitos` **main** `docs/` |
| Doc scope | Curated, ordered allowlist (manifest in the website repo) |
| Brand approach | Full custom rebuild — **drop Starlight**, render through the fluorescence shell |
| URLs | `/docs` hub + `/docs/<slug>`; 301 redirect `/quickstart`→`/docs/quickstart`, `/architecture`→`/docs/architecture` |
| Architecture page | Extracted from the engine **README** `## Architecture` section; mermaid rendered in-brand |

## Architecture (data flow)

```
prebuild → scripts/sync-engine-docs.mjs
   ├─ shallow-fetch mitos-run/mitos @ main : docs/* + README.md + docs/assets/*
   ├─ apply curated MANIFEST (allowlist + order + groups)
   ├─ transform each doc (frontmatter, link-rewrite, asset copy)
   ├─ extract README "## Architecture" → architecture.md (+ render mermaid → brand SVG)
   └─ write to gitignored src/content/engine-docs/  +  record source SHA
        ↓
Astro `docs` content collection (glob loader)
        ↓
/docs (hub, grouped cards)   +   /docs/[...slug] (DocsLayout)
        ↓
vercel redirects: /quickstart→/docs/quickstart, /architecture→/docs/architecture
```

The fetched directory `src/content/engine-docs/` is **gitignored**. That is what
mechanically enforces single-source-of-truth: no doc copy is ever committed to the
website repo, and a stale copy cannot silently drift from `main`.

## Components

Each unit has one purpose, a defined interface, and is independently testable.

### `scripts/sync-engine-docs.mjs` (prebuild)

Runs before `astro build` (wired into the `build` and `dev` npm scripts via a
`predev`/`prebuild` step or an explicit chained call). Composed of sub-modules:

- **fetch** — sparse, shallow clone (`git clone --depth 1 --filter=blob:none
  --sparse`, sparse-checkout `docs README.md`) of `mitos-run/mitos` `main` into a
  temp dir. Records the resolved commit SHA. On any failure, **exit non-zero with a
  clear error** — the build must fail rather than ship empty/stale docs.
- **manifest** — reads `src/data/docs-nav.ts` (the allowlist). Errors, naming the
  file, if an allowlisted source doc is missing upstream (rename/removal guard).
- **transform** — per allowlisted doc:
  - Derive frontmatter: `title` from the first `# H1`; `description` from the first
    paragraph (trimmed); inject `slug`, `group`, `order`, and `sourceUrl`
    (`github.com/mitos-run/mitos/blob/<sha>/docs/<file>`).
  - Rewrite cross-links: `](foo.md)` and `](./foo.md#anchor)` → `](/docs/foo#anchor)`
    when `foo` is allowlisted; otherwise (non-allowlisted doc, or repo file like
    `CONTRIBUTING.md` / `LICENSE`) → absolute GitHub URL. No broken internal links,
    no leaked internal pages.
  - Copy referenced assets from `docs/assets/` into `public/docs-assets/` and
    rewrite their paths.
- **readme-architecture** — extract the README `## Architecture` section
  (everything from that heading to the next `## `). Render the embedded mermaid
  block to a brand-themed SVG; emit the rest as markdown. Output `architecture.md`
  into the engine-docs dir with `slug: architecture`.

### `src/data/docs-nav.ts` (the manifest)

The curated information architecture. Website IA — lives in the website repo, not
the engine. An ordered list of groups, each with ordered slugs. Initial grouping
(refine during implementation against the actual allowlist):

- **Start here** — quickstart, install, architecture
- **SDK & CLI** — cli, mcp
- **Sandboxes** — lifecycle, workspaces, volumes
- **Networking** — networking, ports, preview-urls
- **Operations** — metering, observability
- **Security** — threat-model
- **Migrating** — migrating-from-e2b

Internal/release docs (releasing, redhat-certification, operatorhub,
security-review-policy, migration-to-mitos-org, facade-conformance, distribution,
krew, supply-chain, compliance-claims, …) are **not** in the manifest and never
build.

### `src/layouts/DocsLayout.astro`

The Site.astro shell (nav, `.field`, footer) plus docs chrome:

- **Left sidebar** — grouped nav from the manifest, current page highlighted.
- **Body** — `.prose` article + sticky right-rail TOC, **reused from
  `src/pages/blog/[slug].astro`** (same prose styles and TOC behavior).
- **Footer of article** — "View source on GitHub @ `<sha>`" link (to `sourceUrl`)
  and prev/next within the manifest order.

### Pages

- **`src/pages/docs/index.astro`** — branded hub: short intro + grouped cards
  linking to each doc.
- **`src/pages/docs/[...slug].astro`** — per-doc route over the `docs` collection,
  rendered through `DocsLayout`.

### Config & collection changes

- **`astro.config.mjs`** — remove `@astrojs/starlight`. Add standalone
  **`astro-expressive-code`**, carrying over the existing `themes` /
  `styleOverrides` so code blocks stay branded for **docs and the blog** (Starlight
  currently provides Expressive Code site-wide, including the blog, so it must be
  replaced or the blog's code blocks regress). Drop the Starlight `sitemap` coupling
  and configure `@astrojs/sitemap` directly.
- **`src/content.config.ts`** — replace the Starlight `docs` collection with a
  glob-loader collection over `src/content/engine-docs/`. Schema: `title`,
  `description`, `slug`, `group`, `order`, `sourceUrl`.
- **Remove** `src/content/docs/architecture.md`, `src/content/docs/quickstart.md`,
  and `src/components/starlight/Footer.astro`.
- **`.gitignore`** — add `src/content/engine-docs/` and `public/docs-assets/`.

### Redirects & internal links

- **`vercel.json`** — add 301 redirects `/quickstart`→`/docs/quickstart` and
  `/architecture`→`/docs/architecture` (preserve SEO link equity and external
  inbound links).
- **Internal links** — update in-repo references to the new paths: nav `DOCS` const
  and `SiteFooter` (`/quickstart`→`/docs/quickstart`, add `/docs`), the "Read the
  architecture" buttons on `index.astro` and `compare/[slug].astro`
  (`/architecture`→`/docs/architecture`), and the structured-data `softwareHelp` /
  other `/quickstart` references. Note: `SIGNUP = '/quickstart'` is a *placeholder
  for the not-yet-live hosted console*, distinct from docs — repoint it to
  `/docs/quickstart` for now (same as today's behavior) but keep its TODO.

## Resilience & edges

- **Fetch failure** → build fails loudly. No committed fallback (that reintroduces a
  copy).
- **Manifest drift** → sync errors naming the missing file; we update the manifest
  deliberately.
- **Link integrity** → non-allowlisted / repo-file links rewrite to GitHub URLs.
- **Mermaid** → exactly one diagram. Build-time render to a brand-themed SVG
  (mermaid `base` theme + fluorescence `themeVariables`: transparent background,
  `--field-1` fills, `--hairline` edges, `--ink` text, magenta/cyan accents).
  Client-side mermaid with the same theme is the fallback if build-time rendering is
  too heavy on Vercel.

## Testing

- **Unit (fixtures):** `transform` (link rewrite, asset rewrite, frontmatter
  derivation) and `readme-architecture` extraction.
- **CI smoke:** run sync + `astro build`; assert every manifest slug produced a
  page, no broken internal links, redirects resolve.
- **Brand pass:** `/audit` and `/critique` (interface-design skills) plus
  `scripts/cdp-shot.mjs` screenshots checked against `docs/brand/brand.md`.

## Out of scope (v1)

- **Full-text search.** Starlight's Pagefind search is dropped. The curated set is
  small; Pagefind can be re-added over a static build later if desired. Noted, not
  built now.
- **Versioned docs.** Always tracks `main`.
- **Editing docs from the website.** Source edits happen upstream in the engine repo
  (the "View source" link points there).
