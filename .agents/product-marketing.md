# Product Marketing Context

*Last updated: 2026-06-23. Single source of truth for positioning, messaging, and voice. Other marketing skills (copywriting, competitors, cro, ads, seo) read this first. When this and the brand book (`docs/brand/brand-book.md`) disagree on voice, the brand book wins; when this and `docs/brand/*` or the pricing engine docs disagree on facts, those win. Numbers here marked "illustrative" are never to be published as fact.*

## Product Overview
**One-liner:** Run a thousand agents in parallel, each forked from the same warm, live machine.

**What it does:** mitos is managed microVM infrastructure for AI agent swarms. Its signature primitive is a live copy-on-write fork of a *running* Firecracker microVM into N isolated daughters (~27 ms to activate, ~3 MiB marginal memory per daughter at fork time). You fork one warmed-up agent into a fleet that all start from identical live state, instead of rebuilding that state N times. Hosted SaaS, plus an Apache-2.0 open-source engine you can self-host.

**Product category (the shelf):** AI agent sandboxes / agent compute infrastructure ("a computer for every agent"). Buyers search this shelf with "AI agent sandbox," "code interpreter sandbox," "E2B/Modal/Daytona alternative," "run untrusted AI code."

**Product type:** Usage-based PaaS (managed cloud) on top of an open-source engine (open-core-by-trust, not paywall).

**Business model:** Pay-as-you-go. Decoupled per-second vCPU + RAM, storage GiB-hour, GPU-second; egress free; $100 signup credit; soft + hard spend caps on by default. All rates are **illustrative placeholders** until a deployment sets them.

## Target Audience
**Target companies:** Teams building AI agent products and agent platforms, early-to-growth stage; AI-native startups, applied-AI teams inside larger companies, eval/RL/research teams. Not regulated-enterprise-compliance-first buyers (no SOC2 yet).

**Decision-makers:** The AI agent engineer is user, champion, and (at this stage) usually buyer. Technical influencer = the platform/infra lead who worries about isolation and lock-in.

**Primary use case:** Fan one running agent out into many parallel ones, cheaply and fast, without rebuilding state per agent.

**Jobs to be done:**
- When I need to try many approaches at once, fork my warm agent into N parallel variations so I can run best-of-N / tree search / MCTS without paying to rebuild state N times.
- When I run RL rollouts or large eval sweeps, spin up thousands of identical environments from one template and collapse them back to zero.
- When my agent runs untrusted, model-generated code, isolate each one in its own real machine so a bad step can't reach the host or its siblings.
- When I commit to infra, keep a guaranteed exit (run the same engine myself) so I'm never locked in.

**Use cases:** best-of-N sampling, RL rollouts, tree search / MCTS, agent evals, parallel tool execution, branching long-running agent sessions, untrusted code execution.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---|---|---|---|
| AI agent engineer (user + champion) | DX, the fork primitive, real reproducible numbers, no lock-in | Fanning agents out is slow and expensive; rebuilding warm state per agent burns time and money | Fork a live agent into a swarm in ~27 ms; pay ~3 MiB per fork, not N whole VMs |
| Platform / infra lead (technical influencer) | Isolation strength, reliability, cost predictability, exit risk | Running untrusted model code safely; avoiding a closed-vendor trap and surprise bills | Own-kernel microVM per agent; Apache-2.0 engine; hard spend caps |
| Founder / eng lead (economic buyer) | Speed to ship, cost at scale, betting on the right primitive | Build vs buy; will this vendor survive and not gouge | Managed so you don't run the cluster; open so you're never trapped |

## Problems & Pain Points
**Core problem:** Running *many* agents from one live state is the bottleneck. Most sandbox tools create fresh environments, so every parallel agent re-pays the cost (time + money) of getting back to the warmed-up, mid-task state you already had.

**Why alternatives fall short:**
- Fresh-sandbox tools (E2B, Cloudflare, Vercel Sandbox) rebuild state per agent — no live fork.
- Snapshot/restore (Modal) saves and reloads disk/checkpoint, which is not copying a *running* machine's live memory + processes into many daughters at once.
- The one true twin (Morph Infinibranch) is closed, with vaguer published numbers and no per-fork memory density.
- Daytona forks at the filesystem/snapshot level, defaults to container (not microVM) isolation, and is AGPL (copyleft some teams can't adopt).

**What it costs them:** Wasted compute spend rebuilding state, slower iteration on best-of-N / RL, and either an ops burden (self-hosting Firecracker) or a closed-vendor trap.

**Emotional tension:** Bill anxiety (the "$23k surprise bill" scar, opaque credit units); fear of running untrusted model code; distrust of "open source" that secretly needs the vendor's cloud.

## Competitive Landscape
**Category language (from positioning research):** every player leads on **security/isolation** (now table stakes — "secure," "isolated," "safest way to run code you didn't write") and **speed** (a milliseconds arms race — Blaxel 25 ms, Daytona sub-90 ms, "sub-second"), and expresses **scale** as raw concurrency counts ("100k+ sandboxes"). Cost and openness are rarely in the hero.

**The white space nobody owns:** the buyer *outcome* of **running many agent variations in parallel from one warm, live state** — and the verb **fork/branch a *running* machine** (everyone else says "snapshot," a save/restore framing). This is our lane.

- **E2B** — direct. Mature, Apache-2.0 Firecracker microVMs, big SDK. Can't live-fork (creates fresh sandboxes). Concede isolation + maturity; win on fork-into-a-swarm.
- **Modal** — adjacent platform. Broad Python/ML + GPU; gVisor isolation; snapshot, not live fork; closed. Concede breadth + GPU; win on own-kernel isolation + live fork + open.
- **Daytona** — direct, closest fork narrative. Very fast create, Computer Use, broadest SDK matrix, 72k stars. **Now ships fork-of-memory, but experimental + access-gated ("contact support") + lifecycle-coupled (parent can't be deleted while it has fork children) + container-based + AGPL server stack.** Its "snapshots" are golden images (docker build/pull), not runtime state — its own users flagged the confusion (#3649). Win on: **GA, ungated** live fork; **microVM by default** (they're container-default); **Apache-2.0 across the board** (their server is AGPL copyleft); true runtime-state snapshots.
- **Morph (Infinibranch)** — the real twin. Branches running VMs; closed; sub-250 ms; no published memory density; sits alongside its code-edit models. Win on published reproducible numbers + open source + the managed-and-open combination.
- **Blaxel** — persistence + 25 ms resume + enterprise (SOC2). Avoid the "persist forever" and pure-speed lanes; keep fork-into-N vs resume-to-self distinct.
- **Vercel Sandbox / Cloudflare Sandboxes** — security-led, ephemeral, fresh spin-up. Concede security parity fast; pivot to fan-out.

**Secondary/indirect:** roll-your-own Firecracker (ops burden); OSS `forkd` (forks, unmanaged); generic container sandboxes (weaker isolation for untrusted code).

**Demand signal from competitor repos (GitHub, mined 2026-06-23):** the fork-into-a-swarm primitive is wanted everywhere and owned by no one in a managed + open form.
- **Validated by traction:** `forkd` (OSS fork-from-warm) drew ~2,700 stars in ~6 weeks on the primitive alone; microsandbox ~6,650; a downstream consumer repo requests a "mitos snapshot-fork provider + fork-warmed fan-out" by name.
- **Punted / declined / gated by everyone else:** Firecracker keeps clone/fork *out of core* (open FRs #5795 in-VMM CoW, #3061 CoW rootfs) and warns re-restoring one snapshot N times is **insecure**; E2B **closed** live-fork (#928 → "use snapshots"), swarm coordination (#1330, *"every multi-agent user rebuilds this"*), and AWS/on-prem self-host (#864); Modal and CodeSandbox sell it **closed-core**; Daytona's fork is experimental/access-gated/lifecycle-coupled/container/AGPL.
- **Lived pain to exploit:** E2B reliability (template builds, 502s, data-loss on 2nd resume #884, timeouts not honored #879); Daytona self-host brittleness + the top-reacted ask for decoupled storage without a cold-start (#3413); forkd security/uniqueness bugs + kernel-version sensitivity (not managed).
- **Incomplete DX race everywhere:** MCP server, TypeScript SDK parity, agent-framework recipes (LangGraph/CrewAI/AutoGen), a snapshot/template hub — none complete; a polished managed surface leapfrogs.
- **Honesty:** `forkd` publishes reproducible bench scripts; vague claims get checked. Compete on the managed + safe + open combination, and publish our own reproducible benchmarks (same workload, memory-delta-per-child).

## Differentiation
**The honest moat is the combination nobody else holds:** a **managed, reliable, microVM-safe** **live** CoW fork of *running* memory (~27 ms, ~3 MiB/daughter, reproducible) **+** honest copy-on-write economics (kills bill-shock) **+** a real **Apache-2.0** exit **+** fully **managed**, with the fork **GA and ungated**. No single metric is the moat — and we do NOT claim "fastest/densest" (the OSS `forkd` publishes ~0.12 MiB/child, denser than our ~3 MiB). We win on the *combination* nobody offers managed + safe + open, and we publish reproducible benchmarks rather than superlatives.

**VOC-validated buyer priority:** security/isolation is the **gate** (pass/fail, not better/worse), fan-out/scale is the **converter** (where the ambitious RL/eval buyer's aspiration lives, fastest-growing and least saturated), speed is the **tie-breaker** (quoted in ms), cost is the **objection-handler** (never a hero lead). **The order flips by segment** — see below.

**How we say it (benefit-led, buyer's words):**
- **Lead with the job and the guarantee in one breath:** "Turn one agent into a thousand, each in its own isolated microVM." / "Run every branch, rollout, and best-of-N in parallel. Hardware-isolated. No cold-start tax." The fan-out outcome converts; naming isolation in the same breath clears the security gate so we are not dismissed.
- **Proof (the how):** fork a *running* machine, ~27 ms, ~3 MiB per fork, reproducible from the open repo.
- **Tie-breaker:** spins up in milliseconds; own-kernel Firecracker microVM under KVM (a stronger default than shared-kernel containers or gVisor).
- **Objection-handler, never the lead:** "no base fee, no runaway-loop bills: per-second, copy-on-write, hard spend caps you control."
- **Trust wedge (emotionally charged, verified):** Apache-2.0 engine, the same code the managed service runs, a real exit, versus the AGPL-plus-closed-control-plane incumbents. "Your insurance, not your homework."

**Segment flip (load-bearing):**
- **Fan-out / RL / eval buyer (our wedge):** lead SCALE (the fan-out outcome) then SPEED; security assumed and stated once. Insider vocabulary (fork, rollouts, best-of-N) signals we are one of them.
- **Untrusted-code / app / enterprise buyer:** lead SECURITY/ISOLATION hard, then scale. Relevant to a future `/security` page (#27), less to the fan-out landing.

**Managed is the product; open source is the trust signal** (no lock-in, verifiable, exit hatch), never "self-host is our offering."

**Two differentiation angles the repo research surfaced:**
- **The fork is a *security* story, not only speed.** Firecracker's own docs warn that re-restoring one snapshot N times is insecure (duplicated RNG seeds, entropy, machine IDs, tokens). A fork that gives each daughter fresh uniqueness (reseeded entropy, regenerated IDs, per-clone network namespace) is safe-by-construction — it clears the security *gate* the others leave to hand-rolled orchestration. "Every daughter is a unique, isolated machine, not a duplicated clone."
- **Reliability and honest snapshot semantics as features.** The incumbents' lived pain is reliability (E2B: build failures, 502s, data-loss on resume) and "snapshots" that are really golden images (Daytona). "It just works, hosted, and a snapshot means your real running state" is a credible, differentiated promise.

## Frame control for competitive content (load-bearing)
Honesty is a weapon, not a giveaway. Our audience proves rather than gets persuaded, and verifies every claim, so one-sided shilling backfires. But fairness must not become *recommending competitors*. Rules for every comparison/alternatives page and `competitors.ts`:
1. **Open and close on the outcome we own** (parallel fleet from a live state). Concessions live in the contained middle.
2. **Concede table-stakes (security, sometimes speed) fast and briefly** — one line, then leave. Don't spend real estate praising their strengths.
3. **Make "choose them when" a disqualifier framed as the buyer's *situation*, never the competitor's merit.** Do not praise a rival even in an "only if" ("most adopted," "broad platform," "fastest," "with GPU"); phrase it as the absence of our value ("you run one sandbox and never fan out"). **Lead every card and answer with mitos**, not the competitor.
4. **Always pivot a concession to our win** in the same breath ("X is more mature; but if fan-out is your bottleneck, that's the whole reason mitos exists").
5. **Never fabricate** competitor data, logos, stars, or testimonials; never claim live-fork is unique/industry-first (Morph, Daytona, forkd fork too). Win on the combination.

## Objections
| Objection | Response |
|---|---|
| "You're pre-1.0 / less proven than E2B." | True today. We bet on one thing — the fastest, densest live fork — and keep the engine open so you're never trapped while we mature. |
| "Forking a VM isn't unique; Morph/Daytona do it." | Correct, and we say so. The difference is fork-of-*running*-memory with published, reproducible numbers, microVM isolation, and Apache-2.0 — the combination, not the verb. |
| "Is it secure enough for untrusted code?" | Every fork is a Firecracker microVM with its own kernel under KVM — a stronger default than shared-kernel containers/gVisor. |
| "Will I get a surprise bill?" | Per-second billing, no idle charge, copy-on-write so you pay dirtied pages not whole VMs, and hard spend caps on by default. |
| "Can I self-host / am I locked in?" | The engine is Apache-2.0 on GitHub — the same code the managed service runs. Run it yourself anytime. |
| "Hosted console isn't live yet." | Run the open-source engine today / request early access. No fake signup. |

**Anti-persona:** compliance-first regulated buyer who needs SOC2/HIPAA today; single sequential-sandbox user who never fans out (E2B fits them better — and that's fine to say).

## Switching Dynamics (JTBD forces)
- **Push:** Docker is slow (10-20s to spawn) and "not a real OS"; shared-kernel blast radius (one container off the rails hits the rest); agents reason around soft sandboxes and disable them; managed sandboxes "die after a few minutes," losing state; surprise/runaway bills; rebuilding warm state per agent is slow and expensive.
- **Pull:** fork a live agent into a swarm in ~27 ms; pay ~3 MiB per fork; per-tenant isolation by default; managed so there is no cluster to run; Apache-2.0 self-host exit for cost control and no lock-in. ("The snapshot story alone is worth the migration.")
- **Habit:** already wired into E2B's/Modal's SDK and decorators (hard to move code elsewhere); "hardened Docker covers ~95%"; "running one tiny agent on a host you own, Docker is fine."
- **Anxiety:** vendor survival (most AI startups predicted to fail); closed runtime = no escape hatch; runaway-loop bills; sandbox-escape CVEs; pre-1.0 maturity and migration effort; will the fork actually be faster/cheaper for *my* workload.

## Customer Language
**Words to use (buyer-legible, recurring in the category):** fork, branch, **a running / live state**, parallel, in parallel, fleet, swarm, spin up, isolated, secure, own kernel, microVM, milliseconds, ~27 ms, ~3 MiB, scale, best-of-N, RL rollouts, tree search, evals, open source, Apache-2.0, no lock-in, copy-on-write.

**Words to avoid as the lead (crowded/owned or off-brand):** "secure sandbox" as the headline (table stakes; Vercel owns "safest way to run code you didn't write"), "persist forever" (Blaxel), "developer experience that feels local" (Modal), and the slop lexicon (delve, leverage, unlock, unleash, empower, seamless, robust, supercharge, world-class, game-changer, cutting-edge, blazing fast). No "not just X, it's Y." No em/en dashes.

**Glossary (use only where the mechanism literally maps — one biology word per idea):**
| Term | Meaning |
|---|---|
| fork / divide | copy a running microVM into daughters (API: fork; prose: divide) |
| colony / swarm | the N daughters from one parent |
| daughter / clone | a single forked microVM |
| lineage | the parent → daughter chain (vm-0 → vm-0.3 → vm-0.3.1) |
| genome | the shared copy-on-write base pages |

**Verbatim voice of customer (the two themes with genuine buyer voice — safest to echo):**
- *Bills:* "if my bill goes above X, shut down the service instead of continuing to charge me"; "I'd rather get an $8 bill every month as insurance than ever worry about" a runaway bill (Hacker News). The ~$23k Vercel scar = usage pricing with no cap and a meter you can't see in real time.
- *Security:* "It only takes one mistake or one prompt injection to compromise the whole system" (INNOQ); "we still don't know how to 100% reliably prevent this" (Simon Willison, the lethal trifecta); agents reason around soft sandboxes and disable them; "containers share the host kernel ... when one goes off the rails, the rest feel it"; Docker is "really slow (10-20s to spawn)" and "not a real OS" (Manus).
- *Insider-word nuance:* fork, branch, swarm, best-of-N, checkpoint, rollouts are "second-layer" words — absent from competitor headlines, alive in docs and developer talk. Powerful in body copy and for the RL/fan-out wedge; risky as the literal broad headline. Lead with the job ("turn one agent into a thousand"), then name the mechanism.

## Brand Voice
**Tone:** precise, fast, quietly confident — a senior systems engineer who knows the biology and never overplays it. Biology supplies verbs, never adjectives.
**Style:** prove, don't persuade — every adjective becomes a number, unit, or mechanism; state the mechanism and let it be the benefit; name the tradeoff honestly; vary sentence length, let one land short.
**Personality:** instrument-grade, honest, technical, understated, ownable. CTAs are imperative and name the real action ("Fork a sandbox," "Run the benchmark," "Read the spec") — never "Get started" / "Learn more." No eyebrow/kicker labels above headlines. Full rules: `docs/brand/brand-book.md` §8.

## Proof Points
**Metrics (illustrative / reproducible-from-bench, never stated as competitor-beating fact):** ~27 ms to activate a warm fork; ~3 MiB marginal memory per daughter at fork time (the fork-time floor, not steady state — do not claim a big "Nx less memory" factor); per-second billing; egress free; $100 signup credit; hard spend caps.
**Openness:** Apache-2.0 engine on GitHub; the managed service runs the same code. Real GitHub star count only (no fabrication; fall back to "open source" if low).
**Honesty constraints (do not regress):** no fabricated logos/testimonials/stars; no SOC2/compliance or suspend-to-zero claims; hosted console not live → CTA is run-the-OSS-engine / early access; rates labelled illustrative; CoW marginal is a fork-time floor; egress-free is parity not a unique win; fork-not-unique. **Do not invent a "Daytona AGPL got torched on HN" thread or quote — it is not a real canonical thread.** The OSS/lock-in wedge is real but must lean on verified structural facts (AGPL is a corporate non-starter, e.g. Google bans it; Daytona's control plane is not fully open) plus the general fake-OSS backlash and the YC "Runtime" HN thread, not a fabricated Daytona quote.
**Value themes:**
| Theme | Proof |
|---|---|
| Parallelism from one live state | live CoW fork of running memory into N daughters |
| Speed | ~27 ms warm-fork activate (reproducible) |
| Honest economics | ~3 MiB/fork marginal, per-second, no idle, hard caps |
| Strong isolation | Firecracker microVM, own kernel, KVM |
| No lock-in | Apache-2.0 engine, same code as managed |

## Goals
**Business goal:** become the default agent-swarm compute primitive for AI agent engineers.
**Conversion action:** run the open-source engine / request early access (until hosted console is live); secondary: run the benchmark, read the docs, star the repo.
**Current metrics:** TBD (pre-launch; hosted console not yet live).
