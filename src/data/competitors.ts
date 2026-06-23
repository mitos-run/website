// Honest, public-docs-based competitor comparisons (as of June 2026). These
// power /compare/<slug> and the /alternatives hub. Positioning rules (see
// .agents/product-marketing.md + the brand/positioning memory):
//  - Lead every beat with mitos; never praise a rival ("most adopted", "broad",
//    "fastest"). End on why teams pick mitos, not on "choose them".
//  - Keep copy short, broad, and accessible: lead with the plain outcome (run
//    many agents at once), insider terms (best-of-N, RL rollouts) are examples.
//  - Honest, not fabricated: never claim live-fork is unique (Morph, Daytona,
//    forkd fork too); managed is the product, Apache-2.0 is the no-lock-in trust
//    signal; mitos rate/latency figures are reproducible-from-bench, never stated
//    as competitor-beating facts. Capability tables stay factual (a tie is a tie).
//  - Never use em or en dashes in copy.

export type Mark = 'y' | 'n' | 'p'; // yes | no | partial

export interface Cell {
  s: Mark;
  t?: string; // short note under the mark
}

export interface Row {
  feat: string;
  mitos: Cell;
  them: Cell;
}

export interface Competitor {
  slug: string;
  name: string;
  /** One-line, neutral descriptor used as a fallback on the hub. */
  blurb: string;
  /** <title> (keep under ~60 chars). */
  title: string;
  /** meta description (~150-160 chars). */
  description: string;
  h1: string;
  lede: string;
  /** The us-focused TL;DR shown up top. */
  verdict: string;
  rows: Row[];
  /** 2-3 prose sections, each leading with mitos. */
  sections: { h: string; body: string }[];
  /** Why teams pick mitos over this competitor (us-focused). */
  mitosWins: string[];
  faqs: { q: string; a: string }[];
}

// mitos's own column is constant across every comparison.
const MITOS: Record<string, Cell> = {
  liveFork: { s: 'y', t: 'memory + processes' },
  marginal: { s: 'y', t: '~3 MiB / fork' },
  isolation: { s: 'y', t: 'Firecracker microVM, KVM' },
  latency: { s: 'y', t: '~27 ms activate' },
  license: { s: 'y', t: 'Apache 2.0' },
  managed: { s: 'y', t: 'yes' },
};

const row = (feat: string, them: Cell, mitos: Cell): Row => ({ feat, mitos, them });

export const competitors: Competitor[] = [
  {
    slug: 'e2b',
    name: 'E2B',
    blurb: 'Apache-2.0 microVM sandbox with a big SDK. Creates fresh sandboxes; no live fork of a running one.',
    title: 'mitos vs E2B: fork a running agent vs fresh sandboxes',
    description:
      'mitos vs E2B for AI agents. Both are Apache-2.0 Firecracker microVMs, but mitos forks a running agent into a fleet while E2B creates fresh sandboxes.',
    h1: 'mitos vs E2B',
    lede:
      'mitos forks a running agent into a fleet, so you can run many at once from one warm machine. E2B runs each agent in a fresh sandbox and does not fork a live one.',
    verdict:
      'Both run agents in Apache-2.0 Firecracker microVMs, so isolation and license tie. The difference is the fleet: mitos forks one running machine into many warm copies; E2B builds each from scratch, and closed the live-fork request as out of scope.',
    rows: [
      row('Fork a running VM (memory + processes)', { s: 'n', t: 'fresh sandbox' }, MITOS.liveFork),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('microVM isolation (own kernel)', { s: 'y', t: 'Firecracker' }, MITOS.isolation),
      row('Open source license', { s: 'y', t: 'Apache 2.0' }, MITOS.license),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'Run many at once',
        body: 'mitos forks the running VM into many daughters that share memory copy-on-write, so each starts warm and you pay only for what changes, about 3 MiB at fork time. E2B builds a fresh sandbox per agent, so each one rebuilds its state from scratch.',
      },
      {
        h: 'Same isolation, same license',
        body: 'Both run each sandbox as a Firecracker microVM with its own kernel, and both ship under Apache 2.0, so the isolation boundary and the no-lock-in promise are a tie. The live fork of a running machine into a fleet is the real difference.',
      },
      {
        h: 'Built for the fleet',
        body: 'Fanning one agent into many is what mitos is built around, managed and open. E2B users asked for a live fork in issue #928, and it was closed as out of scope, pointing instead to snapshots that pause and resume a single sandbox.',
      },
    ],
    mitosWins: [
      'Fork one warm machine into many, instead of rebuilding each agent from scratch.',
      'A live copy-on-write fork: daughters start warm, and you pay about 3 MiB for what changes.',
      'The same Apache-2.0 microVM isolation, plus the live fork E2B closed as out of scope.',
    ],
    faqs: [
      { q: 'Can E2B fork a running sandbox?', a: 'No. E2B creates fresh microVM sandboxes; it does not copy a running one into many. mitos is built around that live fork, so a warmed agent becomes a fleet in milliseconds.' },
      { q: 'Are mitos and E2B both open source?', a: 'Yes, both Apache 2.0. mitos adds the live fork and a published per-fork memory cost, and the managed service runs the same engine you can self-host.' },
      { q: 'Is the isolation different?', a: 'No. Both run each sandbox as a Firecracker microVM with its own kernel. Isolation is a tie; the fork into a fleet is not.' },
    ],
  },

  {
    slug: 'modal',
    name: 'Modal',
    blurb: 'Closed Python and ML platform with GPU. Isolates with gVisor; offers snapshots, not a live fork.',
    title: 'mitos vs Modal: microVM fork vs gVisor sandbox',
    description:
      'mitos vs Modal for AI agents: mitos forks a running microVM and is open source; Modal is a closed, gVisor-based Python and ML platform.',
    h1: 'mitos vs Modal',
    lede:
      'mitos gives each agent its own kernel and forks a running one into a fleet. Modal runs agent code on gVisor with snapshots, and is closed source.',
    verdict:
      'mitos is the open, microVM-isolated primitive: an own kernel per agent and a live fork of running memory. Modal isolates with gVisor, offers snapshot and restore rather than a live fork, and is a closed runtime. For running and forking many agents safely and openly, mitos is built for it.',
    rows: [
      row('Fork a running VM (memory + processes)', { s: 'n', t: 'snapshot' }, MITOS.liveFork),
      row('Isolation model', { s: 'n', t: 'gVisor' }, MITOS.isolation),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('Open source', { s: 'n', t: 'closed' }, MITOS.license),
      row('Native GPU in sandboxes', { s: 'y', t: 'first-class' }, { s: 'p', t: 'GPU-second metered' }),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'Own kernel vs shared kernel',
        body: 'mitos runs each agent in a Firecracker microVM with its own kernel under KVM. Modal isolates with gVisor, a userspace kernel that shares the host kernel surface. For untrusted, model-written code, an own-kernel boundary is the stronger default.',
      },
      {
        h: 'A live fork, not a snapshot',
        body: 'mitos copies a running machine’s memory and processes into many daughters at once, so they resume warm and share pages copy-on-write. Modal offers snapshot and restore, which is not the same as branching one running machine into a fleet.',
      },
      {
        h: 'Open, so you are never trapped',
        body: 'The mitos engine is Apache 2.0, the same code the managed service runs, so you can read it, self-host it, and verify it yourself. Modal is a closed runtime, so the only place to run your workloads is on Modal’s cloud.',
      },
    ],
    mitosWins: [
      'Own-kernel microVM isolation (Firecracker + KVM), a stronger default than gVisor for untrusted code.',
      'A live fork of running memory into a fleet, not snapshot and restore.',
      'An Apache-2.0 engine you can run yourself; Modal is closed.',
    ],
    faqs: [
      { q: 'Does Modal use microVMs?', a: 'Modal isolates with gVisor, a userspace kernel, not a microVM with its own kernel. mitos runs every fork as a Firecracker microVM under KVM, the stronger default for untrusted code.' },
      { q: 'Can Modal fork a running sandbox?', a: 'Modal offers snapshot and restore, not a live fork of running memory into many daughters. That live fork is what mitos is built around.' },
      { q: 'Is Modal open source?', a: 'No, Modal is closed. The mitos engine is Apache 2.0, so you can self-host and you are never locked in.' },
    ],
  },

  {
    slug: 'daytona',
    name: 'Daytona',
    blurb: 'Fast container sandboxes with Computer Use. Memory fork is experimental and gated; the server is AGPL.',
    title: 'mitos vs Daytona: microVM fork vs container sandboxes',
    description:
      'mitos vs Daytona for AI agents: mitos forks running memory by default, microVM-isolated and Apache-2.0; Daytona is container-default with an AGPL server.',
    h1: 'mitos vs Daytona',
    lede:
      'mitos forks running memory into a fleet by default, each agent in its own microVM. Daytona runs containers by default, its memory fork is experimental and access-gated, and its server is AGPL.',
    verdict:
      'mitos forks running memory by default: generally available, microVM-isolated, and Apache-2.0. Daytona added a memory fork, but it is experimental and access-gated, its default isolation is containers, and its server is AGPL. For a fork you can rely on today, openly, mitos is built for it.',
    rows: [
      row('Fork a running VM, generally available + ungated', { s: 'p', t: 'experimental, gated' }, { s: 'y', t: 'default' }),
      row('microVM isolation by default (own kernel)', { s: 'n', t: 'container default' }, MITOS.isolation),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('Permissive license (Apache 2.0)', { s: 'n', t: 'AGPL server' }, MITOS.license),
      row('Sandbox create speed', { s: 'y', t: 'sub-90 ms (their figure)' }, { s: 'y', t: '~27 ms fork (ours)' }),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'microVM by default',
        body: 'Every mitos fork is a Firecracker microVM with its own kernel. Daytona’s default sandbox is a container, with microVM only as an option. For running untrusted, model-written code, the default boundary is what most of your workloads run on.',
      },
      {
        h: 'A fork you can use today',
        body: 'mitos forks running memory by default, generally available and ungated. Daytona added a memory fork, but it is experimental and gated behind a request, and its other snapshots are prebuilt images, not a copy of your live running state.',
      },
      {
        h: 'Apache 2.0, not AGPL',
        body: 'The mitos engine is Apache 2.0 across the board, so you can build on it and self-host with no copyleft terms. Daytona’s client SDKs are permissive, but its server is AGPL, a copyleft license that many companies are unable to adopt.',
      },
    ],
    mitosWins: [
      'A memory fork that is generally available and ungated, not experimental behind a request.',
      'microVM isolation by default (own kernel), where Daytona defaults to containers.',
      'Apache-2.0 across the board, not an AGPL server you cannot freely run.',
    ],
    faqs: [
      { q: 'Does Daytona fork running memory?', a: 'Daytona added a memory fork, but it is experimental and access-gated, and its default sandboxes are containers. mitos forks running memory by default, generally available and microVM-isolated.' },
      { q: 'Is Daytona microVM-isolated?', a: 'By default Daytona uses containers, with microVM as an option. mitos runs every fork as a Firecracker microVM with its own kernel by default.' },
      { q: 'What licenses do they use?', a: 'Daytona is AGPL on its server (its SDKs are permissive). The mitos engine is Apache 2.0 throughout, so there are no copyleft terms when you build on or self-host it.' },
    ],
  },

  {
    slug: 'morph',
    name: 'Morph',
    blurb: 'Closed runtime that branches running VMs, alongside code-edit models. Fewer published numbers.',
    title: 'mitos vs Morph: open, reproducible VM forking',
    description:
      'mitos vs Morph for forking running VMs: both fork live VMs, but mitos publishes reproducible numbers and is Apache-2.0 open source; Morph is a closed runtime.',
    h1: 'mitos vs Morph',
    lede:
      'mitos forks running VMs into a fleet, publishes reproducible numbers, and ships an open engine you can run yourself. Morph branches VMs too, but it is closed, with vaguer public figures.',
    verdict:
      'mitos and Morph both fork running VMs. mitos publishes reproducible latency and memory numbers, runs every fork as a verifiable microVM, and is Apache-2.0 open source. Morph is a closed runtime alongside its code-edit models. If you want the fork in the open, mitos is built for it.',
    rows: [
      row('Fork / branch a running VM', { s: 'y', t: 'Infinibranch' }, MITOS.liveFork),
      row('Published fork latency', { s: 'p', t: 'sub-250 ms (their figure)' }, MITOS.latency),
      row('Published marginal memory per fork', { s: 'n' }, MITOS.marginal),
      row('Open source', { s: 'n', t: 'closed' }, MITOS.license),
      row('microVM isolation (own kernel)', { s: 'p', t: 'undisclosed' }, MITOS.isolation),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'Both fork; one is open',
        body: 'Morph’s Infinibranch branches a running VM into parallel copies, the same idea mitos is built on, so we will not pretend the fork is ours alone. The difference is openness: the mitos engine is Apache 2.0 and you can run it yourself.',
      },
      {
        h: 'Numbers you can reproduce',
        body: 'mitos publishes its figures, about 27 ms to activate a warm fork and about 3 MiB marginal memory per daughter, with the benchmark scripts in the open repo. Morph’s public figure is sub-250 ms, with no per-fork memory density published.',
      },
      {
        h: 'Isolation you can verify',
        body: 'Every mitos fork is a Firecracker microVM with its own kernel under KVM, in code you can read and audit. Morph does not disclose its isolation details, so you take the boundary on trust instead of verifying it for yourself.',
      },
    ],
    mitosWins: [
      'Reproducible latency and memory numbers, with the benchmark scripts in the open repo.',
      'An Apache-2.0 engine you can self-host; Morph is a closed runtime.',
      'microVM isolation you can verify in the code, not undisclosed.',
    ],
    faqs: [
      { q: 'Is mitos the only platform that forks a running VM?', a: 'No. Morph branches running VMs too. mitos competes on reproducible numbers, verifiable microVM isolation, and being Apache-2.0 open source.' },
      { q: 'How does mitos differ from Morph Infinibranch?', a: 'mitos publishes reproducible latency and per-fork memory figures and ships an open engine you can self-host. Morph is closed, with fewer public numbers, alongside its code-edit models.' },
      { q: 'Which is faster?', a: 'mitos publishes about 27 ms to activate a warm fork, reproducible from the repo. Morph cites sub-250 ms for branch and restore. They measure differently, so treat it as context.' },
    ],
  },
];

export const getCompetitor = (slug: string) => competitors.find((c) => c.slug === slug);
