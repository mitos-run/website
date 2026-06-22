// Build-time GitHub star count, fetched once per build (module-level cache).
// Falls back to a baseline if the API is unavailable/rate-limited; the client
// then refreshes it live (see Site.astro). Set GITHUB_TOKEN in CI to avoid the
// unauthenticated rate limit.
const REPO = 'mitos-run/mitos';
const FALLBACK = 3;

let cached: number | undefined;

export async function getStars(): Promise<number> {
  if (cached !== undefined) return cached;
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'mitos-site',
      Accept: 'application/vnd.github+json',
    };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`https://api.github.com/repos/${REPO}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.stargazers_count === 'number') {
        cached = data.stargazers_count;
        return cached;
      }
    }
  } catch {
    /* offline / rate-limited build: fall back */
  }
  cached = FALLBACK;
  return cached;
}

// Compact display: 1240 -> "1.2k", 12400 -> "12k".
export function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '') + 'k';
  return String(n);
}
