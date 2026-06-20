# mitos-website

The open-source marketing site and documentation for **mitos** (https://mitos.run),
built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

This repo also serves the **Go vanity import metadata** for the module
`mitos.run/mitos`, so the GitHub org hosting the code can change without breaking
any Go import.

## What lives here (and what does not)

This repo is **public and open source**: the landing page, docs, and the vanity
import metadata. Keep it that way.

The hosted-service **console, billing, and anything holding secrets stay in a
separate private repo.** Never add Stripe keys, customer data, dashboard code, or
service credentials here.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into dist/
npm run preview  # preview the built site
```

Output is a static site in `dist/`, deployable to any static host (Cloudflare
Pages, Netlify, Vercel, S3 + CDN).

## Go vanity import path

The Go module is `mitos.run/mitos`. When `go get mitos.run/mitos/...` runs, the Go
toolchain fetches `https://mitos.run/mitos?go-get=1` and reads a `go-import` meta
tag to find the real source repository.

- The meta page is `public/mitos/index.html`.
- The host must return it with **HTTP 200** for `/mitos` and **every** `/mitos/*`
  subpath (not a redirect). The rewrite rules are provided for two hosts:
  - Cloudflare Pages / Netlify: `public/_redirects`
  - Vercel: `vercel.json`

### The one value to confirm

`public/mitos/index.html`, `astro.config.mjs`, and this README reference the
source repo as `https://github.com/mitos-run/mitos`. **Confirm the org name** at
migration time and update all three together if it differs. The vanity meta only
works if this URL is exact.

### Verify after deploy

```bash
curl -s "https://mitos.run/mitos?go-get=1" | grep go-import
# expect: <meta name="go-import" content="mitos.run/mitos git https://github.com/<org>/mitos">
GOPROXY=direct go install mitos.run/mitos/cmd/mitos@latest   # end-to-end resolution check
```

The vanity meta must be live **before** the engine repo merges the module-path
rename, or `go get` against the new path will fail.

## Honest claims discipline

Every performance and security claim on the site must trace to a reproducible
artifact in the engine repository (`bench/`, CI, or `docs/`). If a number is not
reproducible, it does not go on the site. This mirrors the engine's
no-unverified-claims rule.

## License

Apache-2.0, matching the engine. See `LICENSE`.
