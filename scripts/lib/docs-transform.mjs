// Pure, dependency-free transforms for engine docs. No fs, no network here so
// the logic is unit-testable in isolation.

const LINK_RE = /\]\(([^)]+)\)/g;

/**
 * Rewrite markdown links:
 *  - bare `name.md` (optionally `./name.md`, with optional #anchor) where `name`
 *    is allowlisted        -> `/docs/name#anchor`
 *  - any other `*.md` link -> GitHub blob URL (so nothing is broken or leaked)
 *  - external / in-page / non-md links -> untouched
 */
export function rewriteLinks(markdown, { allowSlugs, repoBlobBase }) {
  return markdown.replace(LINK_RE, (whole, target) => {
    if (/^(https?:|mailto:|#)/.test(target)) return whole;
    if (!target.includes('.md')) return whole;

    const [path, anchor] = target.split('#');
    const clean = path.replace(/^\.\//, '');
    const bare = clean.match(/^([a-z0-9-]+)\.md$/);
    if (bare && allowSlugs.has(bare[1])) {
      return `](/docs/${bare[1]}${anchor ? '#' + anchor : ''})`;
    }
    // Resolve relative to docs/: `../x.md` -> blob/main/x.md ; `x.md` -> blob/main/docs/x.md
    let repoPath;
    if (clean.startsWith('../')) repoPath = clean.replace(/^\.\.\//, '');
    else repoPath = `docs/${clean}`;
    return `](${repoBlobBase}/${repoPath}${anchor ? '#' + anchor : ''})`;
  });
}

/** First H1 -> title; first non-heading, non-empty paragraph -> description. */
export function deriveFrontmatter(markdown, _opts = {}) {
  const lines = markdown.split('\n');
  const h1 = lines.find((l) => /^#\s+/.test(l));
  const title = h1 ? h1.replace(/^#\s+/, '').trim() : 'Untitled';

  // first paragraph after the H1 that is not a heading/fence/blank
  let desc = '';
  let seenH1 = false;
  let inFence = false;
  for (const l of lines) {
    if (/^#\s+/.test(l)) { seenH1 = true; continue; }
    if (!seenH1) continue;
    const t = l.trim();
    // track fenced code blocks (``` or ~~~)
    if (t.startsWith('```') || t.startsWith('~~~')) {
      inFence = !inFence;
      if (desc) break; else continue;
    }
    if (inFence) continue;
    if (!t || t.startsWith('#') || t.startsWith('<')) {
      if (desc) break; else continue;
    }
    desc += (desc ? ' ' : '') + t;
    // stop at the paragraph break (next line blank handled above)
  }
  // strip inline markdown emphasis and links for a clean meta description
  // (backticks are preserved so inline code reads naturally in the description)
  desc = desc
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
  return { title, description: desc };
}

function yamlEscape(s) { return String(s).replace(/"/g, '\\"'); }

/** Full content-collection file: YAML frontmatter + transformed body. */
export function toContentFile({ markdown, slug, group, order, sourceUrl, allowSlugs, repoBlobBase }) {
  const { title, description } = deriveFrontmatter(markdown);
  const body = rewriteLinks(markdown, { allowSlugs, repoBlobBase });
  const fm = [
    '---',
    `title: "${yamlEscape(title)}"`,
    `description: "${yamlEscape(description)}"`,
    `slug: "${slug}"`,
    `group: "${group}"`,
    `order: ${order}`,
    `sourceUrl: "${sourceUrl}"`,
    '---',
    '',
  ].join('\n');
  return fm + body;
}
