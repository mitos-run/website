// Curated public docs IA. Lives in the WEBSITE repo (this is site information
// architecture, not engine content). Only these slugs ever build. `architecture`
// is sourced from the engine README; every other slug maps to docs/<slug>.md.
export const GROUPS = [
  { id: 'start',      label: 'Start here', slugs: ['quickstart', 'install', 'architecture'] },
  { id: 'sdk-cli',    label: 'SDK & CLI',  slugs: ['cli', 'mcp'] },
  { id: 'sandboxes',  label: 'Sandboxes',  slugs: ['lifecycle', 'workspaces', 'volumes'] },
  { id: 'networking', label: 'Networking', slugs: ['networking', 'ports', 'preview-urls'] },
  { id: 'operations', label: 'Operations', slugs: ['metering', 'observability'] },
  { id: 'security',   label: 'Security',   slugs: ['threat-model'] },
  { id: 'migrating',  label: 'Migrating',  slugs: ['migrating-from-e2b'] },
];

// Flat, ordered list with group + global order. `fromReadme` marks the one doc
// extracted from the README instead of docs/<slug>.md.
export const ALLOWLIST = GROUPS.flatMap((g, gi) =>
  g.slugs.map((slug, si) => ({
    slug,
    group: g.id,
    order: gi * 100 + si,
    fromReadme: slug === 'architecture',
  })),
);

export const ALLOW_SLUGS = new Set(ALLOWLIST.map((d) => d.slug));
