// Honest, public-docs-based competitor comparisons (as of June 2026). These
// power /compare/<slug> and the /alternatives hub. Hard rules (see the brand +
// positioning memory and docs/brand): never claim live-fork is unique or an
// industry-first (Morph, Daytona and others fork too); managed is the product,
// Apache-2.0 is the no-lock-in trust signal; mitos rate/latency figures are
// reproducible-from-bench or illustrative, never stated as competitor-beating
// facts; no fabricated logos, stars, or testimonials. Every page carries the
// "from public docs, not a head-to-head benchmark" caveat. Be fair: each page
// has a genuine "when <competitor> is the better pick" section.

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
  /** One-line, neutral descriptor used on the hub. */
  blurb: string;
  /** <title> (keep under ~60 chars). */
  title: string;
  /** meta description (~150-160 chars). */
  description: string;
  h1: string;
  lede: string;
  /** The honest TL;DR shown up top. */
  verdict: string;
  rows: Row[];
  /** 2-3 prose sections on the real differences. */
  sections: { h: string; body: string }[];
  /** A fair "choose them when" list. */
  pickThemWhen: string[];
  faqs: { q: string; a: string }[];
}

// mitos's own column is constant across every comparison.
const MITOS: Record<string, Cell> = {
  liveFork: { s: 'y', t: 'memory + processes' },
  marginal: { s: 'y', t: '~3 MiB / fork' },
  isolation: { s: 'y', t: 'Firecracker microVM, KVM' },
  latency: { s: 'y', t: '~27 ms activate' },
  license: { s: 'y', t: 'Apache 2.0' },
  pricing: { s: 'y', t: 'per-second, no idle' },
  managed: { s: 'y', t: 'yes' },
};

const row = (feat: string, them: Cell, mitos: Cell): Row => ({ feat, mitos, them });

export const competitors: Competitor[] = [
  {
    slug: 'e2b',
    name: 'E2B',
    blurb: 'Mature Firecracker-microVM sandbox with a big SDK ecosystem. No live fork of running memory.',
    title: 'mitos vs E2B: live-fork microVM sandboxes',
    description:
      'mitos vs E2B for AI agent sandboxes. Both are Apache-2.0 on Firecracker microVMs. The difference: mitos forks a running VM into a swarm; E2B creates fresh sandboxes. Honest, public-docs comparison.',
    h1: 'mitos vs E2B',
    lede:
      'Both run agent code in Firecracker microVMs and both are Apache-2.0, so isolation and licensing are a tie. The real split is what happens when you need many agents from one state: mitos forks a running VM in place; E2B spins up fresh sandboxes.',
    verdict:
      'Pick mitos when you fan one running agent into a swarm (best-of-N, RL rollouts, tree search) and want the live state copied, not rebuilt. Pick E2B when you want the most adopted, battle-tested code-interpreter sandbox and do not need live forking.',
    rows: [
      row('Live fork of a running VM (memory + processes)', { s: 'n', t: 'fresh sandbox' }, MITOS.liveFork),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('microVM isolation (own kernel)', { s: 'y', t: 'Firecracker' }, MITOS.isolation),
      row('Open source license', { s: 'y', t: 'Apache 2.0' }, MITOS.license),
      row('Maturity / adoption', { s: 'y', t: 'very high' }, { s: 'p', t: 'pre-1.0' }),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'Fork a running VM vs create a fresh one',
        body: 'E2B gives every agent its own clean Firecracker sandbox, created on demand. That is exactly right for one-shot code execution. But when you need fifty agents that all start from the same warmed-up, mid-task state, you pay to rebuild that state fifty times. mitos forks the running VM instead: the parent’s memory and processes are copied-on-write into N daughters, so each one starts already warm and pays only for the pages it changes (about 3 MiB right after a fork).',
      },
      {
        h: 'Where the two are genuinely equal',
        body: 'Both use Firecracker microVMs with their own kernel, so the isolation story is the same: a prompt injection that turns into a shell stays inside one disposable VM. Both ship under Apache 2.0, so neither locks you in. If those are your only criteria, E2B’s maturity is a real advantage and we will say so.',
      },
      {
        h: 'Maturity vs the fork primitive',
        body: 'E2B has been run at very large scale and has a deep SDK and integration ecosystem. mitos is pre-1.0 and bets on one thing: the fastest, densest live fork of running memory, managed for you, with the engine open so you are never trapped. If forking a live agent into a swarm is your bottleneck, that bet is the whole point.',
      },
    ],
    pickThemWhen: [
      'You want the most widely adopted, production-proven agent sandbox today.',
      'Your workload is sequential code execution, not fan-out from a shared live state.',
      'You rely on E2B’s existing SDK ecosystem and integrations.',
    ],
    faqs: [
      { q: 'Can E2B fork a running sandbox?', a: 'Not the live running memory. E2B creates fresh microVM sandboxes; it does not copy a running VM’s memory and processes into N daughters. mitos is built around that live fork.' },
      { q: 'Are mitos and E2B both open source?', a: 'Yes. Both are Apache 2.0. The difference is the fork primitive and the published per-fork memory cost, not the license.' },
      { q: 'Is the isolation different?', a: 'No. Both run each sandbox as a Firecracker microVM with its own kernel under KVM. Isolation is a tie; forking is not.' },
    ],
  },

  {
    slug: 'modal',
    name: 'Modal',
    blurb: 'Full Python ML platform with GPU sandboxes. gVisor isolation, snapshots not live forks, closed source.',
    title: 'mitos vs Modal: microVM fork vs gVisor sandbox',
    description:
      'mitos vs Modal for AI agent sandboxes. mitos forks a running Firecracker microVM in ~27ms and is Apache-2.0; Modal is a closed, gVisor-based Python/GPU platform. Honest, public-docs comparison.',
    h1: 'mitos vs Modal',
    lede:
      'Modal is a full serverless platform for Python and ML, with native GPU sandboxes. mitos is narrower and sharper: a live fork of a running Firecracker microVM, open source, managed. The isolation model and the cost of fanning out are where they diverge.',
    verdict:
      'Pick mitos when you want microVM isolation (own kernel) and a live fork of running state for agent swarms. Pick Modal when you want an all-in-one Python/ML platform with native GPU and are comfortable with gVisor isolation and a closed runtime.',
    rows: [
      row('Live fork of a running VM (memory + processes)', { s: 'n', t: 'snapshot' }, MITOS.liveFork),
      row('Isolation model', { s: 'n', t: 'gVisor' }, MITOS.isolation),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('Open source', { s: 'n', t: 'closed' }, MITOS.license),
      row('Native GPU in sandboxes', { s: 'y', t: 'first-class' }, { s: 'p', t: 'GPU-second metered' }),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'microVM vs gVisor',
        body: 'Modal isolates sandboxes with gVisor, a userspace kernel that intercepts syscalls. It is a real security boundary and it is fast to start, but it shares the host kernel surface. mitos gives each fork a full Firecracker microVM with its own guest kernel, isolated by KVM. For running model-written code you do not trust, an own-kernel boundary is the stronger default.',
      },
      {
        h: 'Snapshot vs live fork',
        body: 'Modal can snapshot and restore, but that is not the same as copying a running VM’s live memory and processes into many daughters at once. mitos forks the live machine, so daughters resume warm and share the parent’s pages copy-on-write. For best-of-N and RL rollouts, that is the difference between rebuilding state per attempt and branching it.',
      },
      {
        h: 'Platform breadth vs the fork primitive',
        body: 'Modal is the broader product: functions, batch, GPU, scheduling, an entire ML surface. If you want one platform for everything Python, that breadth is the reason. mitos does one thing and keeps the engine open so you can run it yourself. If your bottleneck is forking agents, not orchestrating ML jobs, narrower wins.',
      },
    ],
    pickThemWhen: [
      'You want a single platform for Python functions, batch jobs, and ML, not just sandboxes.',
      'You need first-class native GPU inside your sandboxes.',
      'gVisor isolation and a closed, fully managed runtime are acceptable for your workload.',
    ],
    faqs: [
      { q: 'Does Modal use microVMs?', a: 'Modal isolates sandboxes with gVisor, a userspace kernel, rather than giving each sandbox its own guest kernel. mitos runs each fork as a Firecracker microVM with its own kernel under KVM.' },
      { q: 'Can Modal fork a running sandbox?', a: 'Modal offers snapshot and restore, not a live copy-on-write fork of running memory and processes into many daughters. That live fork is what mitos is built around.' },
      { q: 'Is Modal open source?', a: 'No. Modal is a closed, fully managed platform. The mitos engine is Apache 2.0, so you can self-host and you are never locked in.' },
    ],
  },

  {
    slug: 'daytona',
    name: 'Daytona',
    blurb: 'Fast, open-source sandboxes with fork and snapshot endpoints. Container isolation by default, AGPL.',
    title: 'mitos vs Daytona: microVM vs container sandboxes',
    description:
      'mitos vs Daytona for AI agent sandboxes. mitos forks a running Firecracker microVM and is Apache-2.0; Daytona is fast but container-isolated by default with filesystem fork/snapshot and an AGPL license. Honest comparison.',
    h1: 'mitos vs Daytona',
    lede:
      'Daytona is fast and open, with very quick sandbox creation and its own fork and snapshot endpoints. The two real differences are the isolation boundary (microVM vs container by default) and what “fork” means: a live copy of running memory, or a filesystem-and-snapshot clone.',
    verdict:
      'Pick mitos when you want microVM isolation by default and a live fork of running memory under a permissive Apache-2.0 license. Pick Daytona when container-level isolation is acceptable, you want very fast create plus Computer Use, and the AGPL copyleft works for you.',
    rows: [
      row('Default isolation', { s: 'p', t: 'container (microVM opt-in)' }, MITOS.isolation),
      row('Fork of running memory + processes', { s: 'p', t: 'filesystem / snapshot' }, MITOS.liveFork),
      row('Published marginal cost per fork', { s: 'n' }, MITOS.marginal),
      row('License', { s: 'p', t: 'AGPL (copyleft)' }, MITOS.license),
      row('Sandbox create speed', { s: 'y', t: 'sub-90 ms (their figure)' }, { s: 'y', t: '~27 ms fork (ours)' }),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'microVM by default vs container by default',
        body: 'Daytona’s default sandbox is container-isolated, with microVM isolation available as an option. mitos is microVM-first: every fork is a Firecracker VM with its own kernel. For running untrusted, model-written code, the default boundary matters, because the default is what most workloads actually run on.',
      },
      {
        h: 'What “fork” means',
        body: 'Daytona added fork and snapshot endpoints, which clone at the filesystem and snapshot level. mitos forks the live machine: the running memory and processes are copied-on-write into daughters that resume warm. Both are useful; they are not the same operation. If you need the running state, not just the disk, that is the distinction.',
      },
      {
        h: 'Apache 2.0 vs AGPL',
        body: 'mitos is Apache 2.0, a permissive license you can build on without copyleft obligations. Daytona is AGPL, which is genuinely open but carries copyleft terms that some teams cannot adopt. Neither is wrong; it is a constraint you should check against your own legal posture before committing.',
      },
    ],
    pickThemWhen: [
      'Container-level isolation is acceptable for your workloads by default.',
      'You want the fastest plain sandbox creation and built-in Computer Use.',
      'AGPL copyleft is compatible with how you ship software.',
    ],
    faqs: [
      { q: 'Does Daytona fork sandboxes?', a: 'Yes, Daytona has fork and snapshot endpoints, but they clone at the filesystem and snapshot level. mitos forks the live running memory and processes copy-on-write into N daughters.' },
      { q: 'Is Daytona microVM-isolated?', a: 'By default Daytona uses container isolation, with microVM available as an option. mitos runs every fork as a Firecracker microVM with its own kernel by default.' },
      { q: 'What licenses do they use?', a: 'Daytona is AGPL (copyleft). The mitos engine is Apache 2.0 (permissive), so there are no copyleft obligations when you build on it.' },
    ],
  },

  {
    slug: 'morph',
    name: 'Morph',
    blurb: 'The closest twin: branches running VMs (Infinibranch). Closed source, with fewer published numbers.',
    title: 'mitos vs Morph: live VM forking compared',
    description:
      'mitos vs Morph for branching running VMs. Both fork live VMs for parallel agents. mitos publishes ~27ms / ~3 MiB figures and is Apache-2.0; Morph (Infinibranch) is closed with fewer public numbers. Honest comparison.',
    h1: 'mitos vs Morph',
    lede:
      'Morph is the closest thing to a twin: Infinibranch branches a running VM into parallel copies, which is the same idea mitos is built on. We will not pretend forking is ours alone. The differences are openness, published numbers, and the managed-plus-open-source combination.',
    verdict:
      'Pick mitos when you want the fork primitive with published latency and memory figures, microVM isolation, and an Apache-2.0 engine you can self-host. Pick Morph when you want their managed branching alongside their fast code-edit models and are fine with a closed runtime.',
    rows: [
      row('Branch / fork a running VM', { s: 'y', t: 'Infinibranch' }, MITOS.liveFork),
      row('Published fork latency', { s: 'p', t: 'sub-250 ms (their figure)' }, MITOS.latency),
      row('Published marginal memory per fork', { s: 'n' }, MITOS.marginal),
      row('Open source', { s: 'n', t: 'closed' }, MITOS.license),
      row('microVM isolation (own kernel)', { s: 'p', t: 'undisclosed detail' }, MITOS.isolation),
      row('Fully managed cloud', { s: 'y' }, MITOS.managed),
    ],
    sections: [
      {
        h: 'Both fork, honestly',
        body: 'Morph’s Infinibranch snapshots, branches, and restores a running VM so an agent can split into parallel copies without stopping the original. That is real, and it is close to what mitos does. The category is not “only mitos forks”; it is “who forks fastest, densest, and most openly.”',
      },
      {
        h: 'Published numbers and openness',
        body: 'mitos publishes its figures and lets you reproduce them: about 27 ms to activate a warm fork and about 3 MiB marginal memory per daughter, with the bench scripts in the open-source repo. Morph’s public figure is sub-250 ms and it does not publish per-fork memory density, and the runtime is closed. If you want to verify the claim yourself, open source is the difference.',
      },
      {
        h: 'The combination, not a single number',
        body: 'The honest moat is not one metric. It is the live fork of running memory, plus honest copy-on-write economics, plus a real Apache-2.0 exit, all managed. Morph holds some of these; mitos is betting on holding all of them at once, with the numbers in the open.',
      },
    ],
    pickThemWhen: [
      'You want Morph’s fast code-edit and apply models alongside VM branching.',
      'A closed, fully managed runtime is acceptable and you do not need to self-host.',
      'You are comfortable without published per-fork memory figures.',
    ],
    faqs: [
      { q: 'Is mitos the only platform that forks a running VM?', a: 'No, and we will not claim it. Morph’s Infinibranch branches running VMs too. mitos competes on fork speed (~27 ms), published memory density (~3 MiB), microVM isolation, and being Apache-2.0 open source.' },
      { q: 'How does mitos differ from Morph’s Infinibranch?', a: 'mitos publishes reproducible latency and per-fork memory figures and ships an open-source engine you can self-host. Morph is closed, with fewer public numbers, alongside its code-edit models.' },
      { q: 'Which is faster?', a: 'mitos publishes about 27 ms to activate a warm fork, reproducible from the repo. Morph’s public figure is sub-250 ms for branch/restore. They are measured differently, so treat it as context, not a head-to-head.' },
    ],
  },
];

export const getCompetitor = (slug: string) => competitors.find((c) => c.slug === slug);
