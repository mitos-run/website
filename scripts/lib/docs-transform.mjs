// Pure, dependency-free transforms for engine docs. No fs, no network here so
// the logic is unit-testable in isolation.

// Match the whole `[text](target)` (and the leading `!` of an image), so image
// refs can be told apart from links. Engine docs never put `]` in link text.
const LINK_RE = /(!?)\[([^\]]*)\]\(([^)]+)\)/g;

/**
 * Rewrite markdown links:
 *  - bare `name.md` (optionally `./name.md`, with optional #anchor) where `name`
 *    is allowlisted              -> `/docs/name#anchor`
 *  - any other relative link (md or a repo file/dir, e.g. `../cmd/sandbox-server`)
 *                                -> GitHub blob URL (so nothing renders as a
 *                                   broken site-relative link or leaks)
 *  - external / in-page / site-absolute (`/...`) links, and image refs -> untouched
 */
export function rewriteLinks(markdown, { allowSlugs, repoBlobBase }) {
  return markdown.replace(LINK_RE, (whole, bang, text, target) => {
    // Leave image asset refs alone; they are handled (best-effort) by the sync.
    if (bang) return whole;
    // External, mailto, in-page anchor, or already site-absolute -> untouched.
    if (/^(https?:|mailto:|#|\/)/.test(target)) return whole;

    const [path, anchor] = target.split('#');
    const clean = path.replace(/^\.\//, '');
    const suffix = anchor ? '#' + anchor : '';

    const bare = clean.match(/^([a-z0-9-]+)\.md$/);
    if (bare && allowSlugs.has(bare[1])) {
      return `[${text}](/docs/${bare[1]}${suffix})`;
    }
    // Any other relative path points into the engine repo. Resolve relative to
    // docs/: `../x` -> blob/main/x ; `x` -> blob/main/docs/x. GitHub redirects
    // blob URLs for directories to the tree view, so dirs resolve too.
    const repoPath = clean.startsWith('../') ? clean.replace(/^\.\.\//, '') : `docs/${clean}`;
    return `[${text}](${repoBlobBase}/${repoPath}${suffix})`;
  });
}

/**
 * Clamp a meta description to <= max chars (Ahrefs/Google flag long ones). Cut
 * at the last sentence boundary when one sits reasonably deep in the string,
 * otherwise at the last whole word with an ellipsis. Never splits a word.
 */
export function clampDescription(s, max = 160) {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const sentence = slice.match(/^[\s\S]*[.!?](?=\s|$)/);
  if (sentence && sentence[0].length >= 80) return sentence[0].trim();
  const word = slice.slice(0, max - 1).replace(/\s+\S*$/, '').trim();
  return word + '…';
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
  return { title, description: clampDescription(desc) };
}

function yamlEscape(s) { return String(s).replace(/"/g, '\\"'); }

/**
 * Remove the first level-1 heading line (and one immediately following blank
 * line). The docs layout renders the page title from frontmatter, so leaving
 * the source H1 in the body would render the title twice.
 */
export function stripLeadingH1(markdown) {
  const lines = markdown.split('\n');
  const i = lines.findIndex((l) => /^#\s+/.test(l));
  if (i === -1) return markdown;
  const drop = lines[i + 1] !== undefined && lines[i + 1].trim() === '' ? 2 : 1;
  lines.splice(i, drop);
  return lines.join('\n');
}

/** Full content-collection file: YAML frontmatter + transformed body. */
export function toContentFile({ markdown, slug, group, order, sourceUrl, allowSlugs, repoBlobBase }) {
  const { title, description } = deriveFrontmatter(markdown);
  const body = rewriteLinks(stripLeadingH1(markdown), { allowSlugs, repoBlobBase });
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
