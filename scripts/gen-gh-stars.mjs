// Generate the GitHub star pill (public/gh-stars.png) from the LIVE star count
// at build time. Runs as part of `npm run build`, so every deploy - including
// the daily cron in .github/workflows/deploy.yml - refreshes the count with no
// manual edits. Used by the founder email signature, served at
// https://mitos.run/gh-stars.png.
//
// Pure vector -> PNG via sharp (already a dependency). The count digits are
// baked-in Geist Mono outlines (scripts/assets/geist-mono-glyphs.json), so no
// runtime font lookup is needed and CI output is deterministic. Mirrors the
// look of src/components/GhStars.astro.
//
// Usage: node scripts/gen-gh-stars.mjs [out.png]   (default: dist/gh-stars.png)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || 'dist/gh-stars.png';
const REPO = 'mitos-run/mitos';
const FALLBACK = 3;
const SCALE = 3; // render at 3x so it stays crisp on retina mail clients

// ---- design tokens (match src/styles/tokens.css + GhStars.astro) ----
const BG = '#0A0C12';                       // --field-1
const BORDER = 'rgba(236,240,250,0.14)';    // --hairline-strong
const INK2 = 'rgba(236,240,250,0.62)';      // --ink-2 (octocat + count)
const AMBER = '#FFC24B';                     // --amber (star)
const PAD_X = 11, PAD_Y = 6, GAP = 6, RADIUS = 999;
const ICON = 15;                            // octocat box
const NUM_SIZE = 13;                        // --text-caption
const STAR_SIZE = 12;                       // --text-micro

const OCTOCAT =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z';

async function getStars() {
  try {
    const headers = { 'User-Agent': 'mitos-site', Accept: 'application/vnd.github+json' };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`https://api.github.com/repos/${REPO}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.stargazers_count === 'number') return data.stargazers_count;
    }
  } catch { /* offline / rate-limited: fall back */ }
  return FALLBACK;
}

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '') + 'k';
  return String(n);
}

// 5-point star centered at (cx,cy) with outer radius ro.
function starPath(cx, cy, ro) {
  const ri = ro * 0.4;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

function buildSvg(label) {
  const glyphs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'assets', 'geist-mono-glyphs.json'), 'utf8'),
  );
  const upm = glyphs.unitsPerEm;
  const s = NUM_SIZE / upm; // font-unit -> px

  const numWidth = [...label].reduce((w, ch) => w + (glyphs.glyphs[ch]?.advance ?? upm * 0.6) * s, 0);
  const contentH = ICON; // tallest element
  const H = contentH + PAD_Y * 2;
  const starW = STAR_SIZE;
  const W = PAD_X + ICON + GAP + starW + GAP + numWidth + PAD_X;
  const midY = H / 2;

  let x = PAD_X;
  // octocat
  const iconY = (H - ICON) / 2;
  const octo = `<g transform="translate(${x} ${iconY}) scale(${ICON / 16})"><path d="${OCTOCAT}" fill="${INK2}"/></g>`;
  x += ICON + GAP;
  // star
  const star = `<path d="${starPath(x + starW / 2, midY, STAR_SIZE / 2)}" fill="${AMBER}"/>`;
  x += starW + GAP;
  // number: each glyph is y-up in font units -> flip with scale(s,-s); baseline centers the cap height
  const baseline = midY + (upm * 0.36) * s; // ~ half cap-height below mid
  let nx = x;
  let nums = '';
  for (const ch of label) {
    const g = glyphs.glyphs[ch];
    if (g) {
      nums += `<g transform="translate(${nx.toFixed(2)} ${baseline.toFixed(2)}) scale(${s} ${-s})"><path d="${g.path}" fill="${INK2}"/></g>`;
      nx += g.advance * s;
    } else {
      nx += upm * 0.6 * s;
    }
  }

  const w = +W.toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${(w * SCALE).toFixed(0)}" height="${H * SCALE}" viewBox="0 0 ${w} ${H}">`
    + `<rect x="0.5" y="0.5" width="${(w - 1).toFixed(2)}" height="${H - 1}" rx="${Math.min(RADIUS, H / 2)}" fill="${BG}" stroke="${BORDER}"/>`
    + octo + star + nums + `</svg>`;
}

const count = await getStars();
const label = formatStars(count);
const svg = buildSvg(label);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`gen-gh-stars: ${count} stars ("${label}") -> ${OUT}`);
