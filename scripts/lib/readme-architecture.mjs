/**
 * Pull the body of the README's `## Architecture` section (everything from that
 * heading to the next `## `). The heading line itself is dropped; the caller
 * prepends a `# Architecture` H1 so deriveFrontmatter() produces a title.
 */
export function extractArchitecture(readme) {
  const lines = readme.split('\n');
  const start = lines.findIndex((l) => /^##\s+Architecture\s*$/.test(l));
  if (start === -1) throw new Error('README has no ## Architecture section');
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join('\n').trim();
}
