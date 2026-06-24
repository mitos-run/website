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
  /** 2-3 prose sections, each leading with Mitos. */
  sections: { h: string; body: string }[];
  /** Why teams pick Mitos over this competitor (us-focused). */
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
    title: 'Mitos vs E2B: fork a running agent vs fresh sandboxes',
    description:
      'Mitos vs E2B for AI agents. Both are Apache-2.0 Firecracker microVMs, but Mitos forks a running agent into a fleet while E2B creates fresh sandboxes.',
    h1: 'Mitos vs E2B',
    lede:
      'Mitos forks a running agent into a fleet, so you can run many at once from one warm machine. E2B runs each agent in a fresh sandbox and does not fork a live one.',
    verdict:
      'Both run agents in Apache-2.0 Firecracker microVMs, so isolation and license tie. The difference is the fleet: Mitos forks one running machine into many warm copies; E2B builds each from scratch, and closed the live-fork request as out of scope.',
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
        body: 'Mitos forks the running VM into many daughters that share memory copy-on-write, so each starts warm and you pay only for what changes, about 3 MiB at fork time. E2B builds a fresh sandbox per agent, so each one rebuilds its state from scratch.',
      },
      {
        h: 'Same isolation, same license',
        body: 'Both run each sandbox as a Firecracker microVM with its own kernel, and both ship under Apache 2.0, so the isolation boundary and the no-lock-in promise are a tie. The live fork of a running machine into a fleet is the real difference.',
      },
      {
        h: 'Built for the fleet',
        body: 'Fanning one agent into many is what Mitos is built around, managed and open. E2B users have asked for a live fork, and the request was closed as out of scope, pointing instead to snapshots that pause and resume a single sandbox.',
      },
    ],
    mitosWins: [
      'Fork one warm machine into many, instead of rebuilding each agent from scratch.',
      'A live copy-on-write fork: daughters start warm, and you pay about 3 MiB for what changes.',
      'The same Apache-2.0 microVM isolation, plus the live fork E2B closed as out of scope.',
    ],
    faqs: [
      { q: 'Can E2B fork a running sandbox?', a: 'No. E2B creates fresh microVM sandboxes; it does not copy a running one into many. Mitos is built around that live fork, so a warmed agent becomes a fleet in milliseconds.' },
      { q: 'Are Mitos and E2B both open source?', a: 'Yes, both Apache 2.0. Mitos adds the live fork and a published per-fork memory cost, and the managed service runs the same engine you can self-host.' },
      { q: 'Is the isolation different?', a: 'No. Both run each sandbox as a Firecracker microVM with its own kernel. Isolation is a tie; the fork into a fleet is not.' },
    ],
  },

  {
    slug: 'modal',
    name: 'Modal',
    blurb: 'Closed Python and ML platform with GPU. Isolates with gVisor; offers snapshots, not a live fork.',
    title: 'Mitos vs Modal: microVM fork vs gVisor sandbox',
    description:
      'Mitos vs Modal for AI agents: Mitos forks a running microVM and is open source; Modal is a closed, gVisor-based Python and ML platform.',
    h1: 'Mitos vs Modal',
    lede:
      'Mitos gives each agent its own kernel and forks a running one into a fleet. Modal runs agent code on gVisor with snapshots, and is closed source.',
    verdict:
      'Mitos is the open, microVM-isolated primitive: an own kernel per agent and a live fork of running memory. Modal isolates with gVisor, offers snapshot and restore rather than a live fork, and is a closed runtime. For running and forking many agents safely and openly, Mitos is built for it.',
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
        body: 'Mitos runs each agent in a Firecracker microVM with its own kernel under KVM. Modal isolates with gVisor, a userspace kernel that shares the host kernel surface. For untrusted, model-written code, an own-kernel boundary is the stronger default.',
      },
      {
        h: 'A live fork, not a snapshot',
        body: 'Mitos copies a running machine’s memory and processes into many daughters at once, so they resume warm and share pages copy-on-write. Modal offers snapshot and restore, which is not the same as branching one running machine into a fleet.',
      },
      {
        h: 'Open, so you are never trapped',
        body: 'The Mitos engine is Apache 2.0, the same code the managed service runs, so you can read it, self-host it, and verify it yourself. Modal is a closed runtime, so the only place to run your workloads is on Modal’s cloud.',
      },
    ],
    mitosWins: [
      'Own-kernel microVM isolation (Firecracker + KVM), a stronger default than gVisor for untrusted code.',
      'A live fork of running memory into a fleet, not snapshot and restore.',
      'An Apache-2.0 engine you can run yourself; Modal is closed.',
    ],
    faqs: [
      { q: 'Does Modal use microVMs?', a: 'Modal isolates with gVisor, a userspace kernel, not a microVM with its own kernel. Mitos runs every fork as a Firecracker microVM under KVM, the stronger default for untrusted code.' },
      { q: 'Can Modal fork a running sandbox?', a: 'Modal offers snapshot and restore, not a live fork of running memory into many daughters. That live fork is what Mitos is built around.' },
      { q: 'Is Modal open source?', a: 'No, Modal is closed. The Mitos engine is Apache 2.0, so you can self-host and you are never locked in.' },
    ],
  },

  {
    slug: 'daytona',
    name: 'Daytona',
    blurb: 'Fast container sandboxes with Computer Use. Memory fork is experimental and gated; the server is AGPL.',
    title: 'Mitos vs Daytona: microVM fork vs container sandboxes',
    description:
      'Mitos vs Daytona for AI agents: Mitos forks running memory by default, microVM-isolated and Apache-2.0; Daytona is container-default with an AGPL server.',
    h1: 'Mitos vs Daytona',
    lede:
      'Mitos forks running memory into a fleet by default, each agent in its own microVM. Daytona runs containers by default, its memory fork is experimental and access-gated, and its server is AGPL.',
    verdict:
      'Mitos forks running memory by default: generally available, microVM-isolated, and Apache-2.0. Daytona added a memory fork, but it is experimental and access-gated, its default isolation is containers, and its server is AGPL. For a fork you can rely on today, openly, Mitos is built for it.',
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
        body: 'Every Mitos fork is a Firecracker microVM with its own kernel. Daytona’s default sandbox is a container, with microVM only as an option. For running untrusted, model-written code, the default boundary is what most of your workloads run on.',
      },
      {
        h: 'A fork you can use today',
        body: 'Mitos forks running memory by default, generally available and ungated. Daytona added a memory fork, but it is experimental and gated behind a request, and its other snapshots are prebuilt images, not a copy of your live running state.',
      },
      {
        h: 'Apache 2.0, not AGPL',
        body: 'The Mitos engine is Apache 2.0 across the board, so you can build on it and self-host with no copyleft terms. Daytona’s client SDKs are permissive, but its server is AGPL, a copyleft license that many companies are unable to adopt.',
      },
    ],
    mitosWins: [
      'A memory fork that is generally available and ungated, not experimental behind a request.',
      'microVM isolation by default (own kernel), where Daytona defaults to containers.',
      'Apache-2.0 across the board, not an AGPL server you cannot freely run.',
    ],
    faqs: [
      { q: 'Does Daytona fork running memory?', a: 'Daytona added a memory fork, but it is experimental and access-gated, and its default sandboxes are containers. Mitos forks running memory by default, generally available and microVM-isolated.' },
      { q: 'Is Daytona microVM-isolated?', a: 'By default Daytona uses containers, with microVM as an option. Mitos runs every fork as a Firecracker microVM with its own kernel by default.' },
      { q: 'What licenses do they use?', a: 'Daytona is AGPL on its server (its SDKs are permissive). The Mitos engine is Apache 2.0 throughout, so there are no copyleft terms when you build on or self-host it.' },
    ],
  },

  {
    slug: 'morph',
    name: 'Morph',
    blurb: 'Closed runtime that branches running VMs, alongside code-edit models. Fewer published numbers.',
    title: 'Mitos vs Morph: open, reproducible VM forking',
    description:
      'Mitos vs Morph for forking running VMs: both fork live VMs, but Mitos publishes reproducible numbers and is Apache-2.0 open source; Morph is a closed runtime.',
    h1: 'Mitos vs Morph',
    lede:
      'Mitos forks running VMs into a fleet, publishes reproducible numbers, and ships an open engine you can run yourself. Morph branches VMs too, but it is closed, with vaguer public figures.',
    verdict:
      'Mitos and Morph both fork running VMs. Mitos publishes reproducible latency and memory numbers, runs every fork as a verifiable microVM, and is Apache-2.0 open source. Morph is a closed runtime alongside its code-edit models. If you want the fork in the open, Mitos is built for it.',
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
        body: 'Morph’s Infinibranch branches a running VM into parallel copies, the same idea Mitos is built on, so we will not pretend the fork is ours alone. The difference is openness: the Mitos engine is Apache 2.0 and you can run it yourself.',
      },
      {
        h: 'Numbers you can reproduce',
        body: 'Mitos publishes its figures, about 27 ms to activate a warm fork and about 3 MiB marginal memory per daughter, with the benchmark scripts in the open repo. Morph’s public figure is sub-250 ms, with no per-fork memory density published.',
      },
      {
        h: 'Isolation you can verify',
        body: 'Every Mitos fork is a Firecracker microVM with its own kernel under KVM, in code you can read and audit. Morph does not disclose its isolation details, so you take the boundary on trust instead of verifying it for yourself.',
      },
    ],
    mitosWins: [
      'Reproducible latency and memory numbers, with the benchmark scripts in the open repo.',
      'An Apache-2.0 engine you can self-host; Morph is a closed runtime.',
      'microVM isolation you can verify in the code, not undisclosed.',
    ],
    faqs: [
      { q: 'Is Mitos the only platform that forks a running VM?', a: 'No. Morph branches running VMs too. Mitos competes on reproducible numbers, verifiable microVM isolation, and being Apache-2.0 open source.' },
      { q: 'How does Mitos differ from Morph Infinibranch?', a: 'Mitos publishes reproducible latency and per-fork memory figures and ships an open engine you can self-host. Morph is closed, with fewer public numbers, alongside its code-edit models.' },
      { q: 'Which is faster?', a: 'Mitos publishes about 27 ms to activate a warm fork, reproducible from the repo. Morph cites sub-250 ms for branch and restore. They measure differently, so treat it as context.' },
    ],
  },

  {
    slug: 'codesandbox',
    name: 'CodeSandbox',
    blurb: 'Closed, hosted SDK that also forks running microVMs, but slower and not self-hostable.',
    title: 'Mitos vs CodeSandbox: open microVM fork vs hosted SDK',
    description:
      'Mitos vs the CodeSandbox SDK for AI agents: both fork a running Firecracker microVM, but Mitos activates in about 27 ms, is Apache-2.0, and self-hosts on your cluster.',
    h1: 'Mitos vs CodeSandbox',
    lede:
      'Mitos and the CodeSandbox SDK both fork a running microVM into copies. Mitos lands a warm fork in about 27 ms, ships under Apache 2.0, and runs on your own Kubernetes cluster; CodeSandbox is closed and hosted only.',
    verdict:
      'CodeSandbox is one of the few runtimes that also forks a running VM, so the fork itself is a tie. The difference is speed, openness, and ownership: Mitos activates a warm fork in about 27 ms against the hundreds of milliseconds CodeSandbox publishes, ships under Apache 2.0, and self-hosts on any KVM Kubernetes cluster, while CodeSandbox stays a closed, hosted SDK.',
    rows: [
      row('Fork a running VM (memory + processes)', { s: 'y', t: '~863 ms fork' }, MITOS.liveFork),
      row('Warm activate latency', { s: 'p', t: '~495 ms resume' }, MITOS.latency),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('microVM isolation (own kernel)', { s: 'y', t: 'Firecracker' }, MITOS.isolation),
      row('Open source license', { s: 'n', t: 'closed, hosted' }, MITOS.license),
      row('Self-host on your cluster', { s: 'n', t: 'hosted only' }, { s: 'y', t: 'any KVM K8s' }),
    ],
    sections: [
      {
        h: 'The same fork, far faster',
        body: 'Mitos and CodeSandbox both fork a running microVM rather than rebuild each from scratch, so the fork is not ours alone. The difference is speed: Mitos lands a warm fork in about 27 ms, while CodeSandbox publishes hundreds of milliseconds.',
      },
      {
        h: 'Open and self-hostable',
        body: 'Mitos ships under Apache 2.0 and runs on any Kubernetes cluster with KVM nodes, so the same engine runs in your account or ours and your data never leaves your infrastructure. The CodeSandbox SDK is closed and hosted, so it stays on their cloud.',
      },
      {
        h: 'A primitive, not a silo',
        body: 'Mitos exposes the fork as a declarative Kubernetes primitive, with CRDs and a published per-fork memory cost of about 3 MiB, so you build your own agent platform on top. CodeSandbox wraps the same fork inside its own closed hosted SDK.',
      },
    ],
    mitosWins: [
      'The same live fork, but a warm activate in about 27 ms instead of hundreds.',
      'Apache 2.0 and self-hostable on any KVM Kubernetes cluster, not a closed hosted SDK.',
      'A declarative microVM primitive with a published per-fork memory cost, built for your own platform.',
    ],
    faqs: [
      { q: 'Does CodeSandbox fork a running sandbox?', a: 'Yes. CodeSandbox is one of the few runtimes that forks a running microVM from a memory snapshot. Mitos does the same, but activates a warm fork in about 27 ms and publishes the per-fork memory cost.' },
      { q: 'Can I self-host CodeSandbox?', a: 'No. The CodeSandbox SDK is closed and hosted only. Mitos is Apache 2.0 and runs on any Kubernetes cluster with KVM nodes, or fully hosted on the same engine.' },
      { q: 'Which is faster?', a: 'Mitos publishes about 27 ms to activate a warm fork, against the hundreds of milliseconds CodeSandbox publishes for live fork and memory resume. Both are self-reported on different hardware, so treat it as context, not a head-to-head benchmark.' },
    ],
  },
];

export const getCompetitor = (slug: string) => competitors.find((c) => c.slug === slug);
