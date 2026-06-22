# Security response headers via Cloudflare

GitHub Pages cannot send custom HTTP response headers, so the audit's three
Security findings (Content-Security-Policy, Strict-Transport-Security,
X-Frame-Options) cannot be fixed in this repo. The fix is to put **Cloudflare**
(free plan is enough) in front of `mitos.run` and inject the headers at the
edge. This does not change hosting: GitHub Pages still serves the site.

## 1. Put mitos.run behind Cloudflare (proxied)

1. Add `mitos.run` as a site in Cloudflare and move the domain's nameservers to
   the two Cloudflare assigns (at your registrar).
2. Recreate the DNS records for the apex pointing at GitHub Pages, **proxied
   (orange cloud)**:
   - `A  mitos.run  185.199.108.153`
   - `A  mitos.run  185.199.109.153`
   - `A  mitos.run  185.199.110.153`
   - `A  mitos.run  185.199.111.153`
   - (and the matching AAAA records: `2606:50c0:8000::153`, `...8001::153`,
     `...8002::153`, `...8003::153`)
3. Keep the `CNAME` file in `public/` (it already pins `mitos.run`) so GitHub
   Pages still accepts the custom domain.
4. In Cloudflare **SSL/TLS → Overview**, set the mode to **Full** (not Flexible;
   Flexible causes a redirect loop with Pages' own HTTPS).

## 2. HSTS

Cloudflare has a dedicated toggle. **SSL/TLS → Edge Certificates → HTTP Strict
Transport Security (HSTS) → Enable**, with:

- `max-age` = `63072000` (2 years)
- Include subdomains: on
- Preload: on (only once you are confident; preload is hard to undo)

## 3. The other headers (Transform Rule)

**Rules → Transform Rules → Modify Response Header → Create rule.** Apply to
`Hostname equals mitos.run`, then **Set static** for each header:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | see below |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), interest-cohort=()` |

### Content-Security-Policy

The site uses inline `<script>`, inline `<style>`, inline JSON-LD, self-hosted
fonts, and a client-side fetch to `api.github.com` for the star count. A static
host cannot use per-request nonces, so the policy allows `'unsafe-inline'` for
script/style (it still satisfies the "has a CSP" check and locks down origins):

```
default-src 'self';
base-uri 'self';
script-src 'self' 'unsafe-inline' https://eu-assets.i.posthog.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' https://api.github.com https://eu.i.posthog.com https://eu-assets.i.posthog.com;
frame-ancestors 'none';
form-action 'self';
upgrade-insecure-requests
```

> The `eu(-assets)?.i.posthog.com` entries are required for the consent-gated
> PostHog analytics (`src/components/Analytics.astro`). They only matter after a
> visitor opts in; without them the analytics script is blocked by CSP. If you
> later enable PostHog **session replay**, also add `worker-src 'self' blob:`.

(One line, no line breaks, when pasted into Cloudflare.)

> If the inline scripts are later moved to external files with subresource
> integrity, drop `'unsafe-inline'` from `script-src` for a stricter policy.

## 4. Verify

```bash
curl -sI https://mitos.run | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy'
```

All six should appear. Then re-run the audit (`squirrel audit https://mitos.run
--format llm -C surface --refresh`) — the Security category should reach 100.

## Notes

- When Cloudflare is live, add it to the sub-processors list on `/privacy`
  (`src/pages/privacy.astro`) since it then processes request traffic.
- This is the only audit category that cannot be satisfied from this repo alone.
