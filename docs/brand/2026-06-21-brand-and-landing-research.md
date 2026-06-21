# mitos — brand & landing research synthesis

Date: 2026-06-21
Status: research complete; feeds the brand/landing issue backlog (GitHub)
Audience #1: **AI agent engineers** (devs building agent products; buy on DX, speed, the fork primitive, trust)

This is the strategic foundation for taking the mitos brand and website from
"competent Vercel clone" to genuinely world-class. It synthesizes five parallel
research streams: beloved dev-brand principles, dev-tool landing/conversion craft,
a competitor category teardown, an ownable identity direction, and a local
tooling/skills audit. Sources are at the bottom of each section's parent issue.

---

## The one finding everything agrees on

Five independent research streams converged on the same verdict:

1. **The current monochrome "Vercel-clone" (#000, Geist, hairline borders) is a
   strategic liability, not a neutral default.** The entire agent-sandbox category
   wears the *same* uniform — dark canvas + one neon accent + monospace + a
   "milliseconds" latency claim. A developer landing on mitos, Vercel Sandbox,
   Daytona, and Blaxel back-to-back **cannot tell them apart.** Per
   Ehrenberg-Bass: that look is *maximally un-distinctive by design* — it builds
   zero memory structure no matter how premium it reads.

2. **"mitos" = mitosis is a gift the brand is wasting.** Cell division — one living
   cell divides into N identical daughters, instantly, by copying itself — is
   *literally* a copy-on-write fork of a running microVM. It is the single most
   ownable metaphor in the category because (a) it's true to the tech, (b) it's in
   the name, (c) no competitor can credibly take it, and (d) it unlocks an entire
   untouched visual + verbal world. The existing logo (a filled disc dividing into
   an open ring, golden-ratio geometry) is *already* a cell-division mark — it's
   frames one and two of a division animation. The system around it just doesn't
   know it yet.

**Decision (2026-06-21):** keep the name "mitos"; rethink the identity. Drop the
Vercel-clone as the house style. Build a living, biological identity around the
dividing cell — credible *because* it borrows real scientific-instrument
aesthetics, not cute biotech ones.

---

## 1. Positioning

### The category cliché to escape
Everyone says a version of: *"secure sandboxes for AI agents, fast, in milliseconds."*
- "Secure sandboxes for AI agents" — E2B, Northflank, Cloudflare, Daytona, Blaxel.
- "Run untrusted / AI-generated code" — Vercel, Cloudflare, Daytona (fear-framing).
- Naked latency-flexing — "milliseconds / sub-second / 25ms / 200ms." Everyone races
  the same clock. **"Agent swarms in milliseconds" anchors mitos to the most crowded,
  least ownable axis in the category.** Speed is table stakes, not a differentiator.

### The ownable white space (ranked)
1. **Biology / living systems** — nobody owns it; the name already promises it. #1 by a mile.
2. **The swarm / the collective as the hero unit** — everyone sells *a sandbox* (singular).
   mitos's unit of value is **N subagents from one parent, alive together.** Own the plural.
3. **"Live-fork AND honestly open-source"** — the unique quadrant. The category has a
   fake-open-source credibility crisis (Daytona's AGPL-but-closed control plane, E2B's
   "open source needs our cloud"). mitos is Apache-2.0, real engine, run-it-yourself.
   State it as identity, not a buried feature-table row.
4. **Honest economics** — universal dev complaint is bill anxiety (Vercel $23k bill,
   Daytona "100x VPS markup," Replit non-rolling credits). CoW metering = you pay for
   ~3 MiB of dirtied pages, not N whole VMs. Nobody owns "honest billing."

### Recommended positioning
> **One agent divides into a thousand.** Fork one running microVM into a swarm of
> isolated subagents — each its own computer, alive in ~27 ms. Open source. Fully managed.

- Leads with **division** (ownable, in the name) instead of joining the milliseconds pileup.
- Makes **the swarm the hero**, claiming the plural the category cedes.
- Active and ambitious ("divides / multiplied") vs the category's fear-framing.
- Keeps the real proof (live fork, ~27 ms, microVM, open + managed) as *support*, not headline.
- **Un-spoofable:** a competitor copying "mitosis / one cell becomes many" looks derivative.

Alt tagline directions: *"Don't boot. Divide."* (attacks cold-boot rivals) ·
*"Give your agents a swarm of computers."* (already the site's best line — promote it) ·
*"The only live-fork sandbox you can actually run yourself."* (OSS trust wedge).

**Retire:** "Agent swarms in milliseconds" as the headline. Keep ~27 ms as proof underneath.

---

## 2. Brand identity — "Fluorescence" (recommended direction)

**Mood:** a live-cell microscope at 2am. Black field, luminous division events,
instrumentation-grade precision. Reads as a scientific imaging rig, *not* a biotech
pamphlet — which is exactly why it stays credible for production infra.

Grounded in how biologists actually see mitosis (confocal/fluorescence microscopy):
luminous signal on a pure-black field, channels color-coded by stain. That visual
language is *already* dark, technical, high-contrast — it looks like a serious dev
tool while being authentically biological. The science's own aesthetic is the bridge.

### Palette (dark-canvas-native)
| Role | Hex | Meaning |
|---|---|---|
| Canvas (void) | `#05060A` | near-black field (deeper than today's `#0a0a0a`) |
| Surface | `#0C0E14` | raised panels |
| Hairline | `#1A1D26` | borders |
| Ink / text | `#E8EBF2` | off-white |
| **Division Cyan** (primary) | `#3DDCFF` | the genome glow — the one signature brand color |
| Colony Green | `#5BF2A8` | "alive and working" state |
| Spindle Magenta | `#FF4D9D` | rationed — only at the instant of division (motion peaks) |
| Lineage Amber | `#FFC24B` | warnings / the "winner" highlight |

Cyan is dominant: survives on black *and* white, and sits clear of the
Stripe-purple / Fly-violet / Clerk-violet cluster and the Modal/Daytona-green,
Cloudflare/E2B-orange, Blaxel-cyan claims. Magenta is *rationed* to division
moments so division feels like an event.

### The signature element — "The Division"
mitos's equivalent of Stripe's gradient or Linear's purple: **one luminous disc on
black that pinches and separates into two identical glowing daughters, a magenta
spindle-flash at the instant of separation, then the daughters drift apart and each
can divide again.**
- It's *literally the product* — `fork()` rendered as mitosis. The aha and the brand are one image.
- It scales fractally: one division = the logo animation; eight chained = the hero
  swarm fan-out; a field of them = the OG image / colony background.
- It encodes the real metrics: daughters share a glowing core (CoW shared genome);
  only the dirtied edge lights up uniquely — teaching "~3 MiB marginal cost" without a chart.
- It's cheap to build: SVG/Canvas, ~600–800 ms, `prefers-reduced-motion` shows the
  final split statically. **The existing logo is frames one and two of this exact animation.**

### Type
Keep **Geist Mono** (excellent for code/telemetry/numerics — used *more* aggressively as
"instrument readout"). Reconsider the **sans**: Geist Sans is literally Vercel's font, so
leaning on it reinforces the clone critique. Evaluate **Satoshi** or **General Sans**
(Fontshare, free) for display to break the look while keeping dev credibility.

### Other directions considered
- **B — "Petri / Lab Light":** Modal-style white canvas, division told through saturated
  editorial color panels + precise diagram figures. Safe, ships fast, least distinctive →
  mine its **diagram discipline for docs.**
- **C — "Colony / Automata":** Conway's-Game-of-Life generative cell field. Highest
  "alive" ceiling, highest credibility risk → mine its **live-colony motion as one
  contained hero accent.**

All three converge: ship A as the system, B's diagrams for docs, C's motion for the hero.

### Credibility guardrails (keep it serious infra)
1. Biology supplies **verbs and color-logic, never decoration.** No microscope photos,
   no squishy blobs, no DNA clip-art. Every biological element must also be functional.
2. Anchor on earned dev-tool credibility: keep Geist Mono, hairlines, code-forward hero,
   black discipline. Biology rides *on top of* a Vercel-grade chassis.
3. Ration color: cyan is the one brand color; magenta only at division; green only for live states.
4. Numbers stay true to the engine (~27 ms warm-claim P50, ~3 MiB CoW marginal).

---

## 3. Voice & verbal identity

**Tone:** precise, fast, quietly confident — a systems engineer who happens to know the
biology and never overplays it. Biology supplies the *verbs*, never the adjectives.

**Owned vocabulary (use truthfully, keep it to four):**
- **fork / divide** — the N-way live CoW fork ("fork" for the API, "divide" for prose).
- **colony / swarm** — N daughters working in parallel.
- **lineage** — the parent→child fork trace (`vm·0 → vm·0.3 → vm·0.3.1`); a real feature framing.
- **daughter / clone** — an individual fork. **genome** — the shared CoW base pages (explains the economics).

Avoid sprawl ("cell/organism/DNA/evolve" everywhere) — discipline is what separates
"ownable system" from "gimmick." Anti-cringe test: strip the voice; if a true, useful,
checkable thing survives (a fix path, a fact, a defensible opinion), the voice is safe.

**Example CLI (memorable *and* useful — every biology word carries real payload):**
```
$ mitos fork --count 8
  ⊕ dividing vm·0 …
  ✓ colony ready · 8 daughters · 27ms · +3.1 MiB/fork (copy-on-write)
$ mitos lineage vm·0.3.1
  vm·0 → vm·0.3 → vm·0.3.1   (forked 3.2s ago · diverged 412 KiB)
✗ cannot fork vm·0.3: parent terminated. A daughter can't outlive a dead lineage.
```

---

## 4. Landing craft (keep / replace)

Current page bones are genuinely strong. The verdict per section:

**Keep (world-class):** code-forward tabbed hero with a real `fork(8)` aha; the fork-fan
concept; the honest comparison table; reduced-motion discipline; no fake logos/stars; real
benchmark numbers.

**Replace (generic):**
1. **Scroll-gated one-shot fork animation → live / interactive.** NN/G research: scroll-
   triggered reveals on primary content *hurt* B2B conversion ("loss of control"). E2B proves
   an *always-running* demo wins. Make the Division loop subtly and be user-triggerable
   ("Run fork(8)"). This is the single biggest upgrade — and the one place lavish motion is earned.
2. **Buried latency number → hero.** mitos has the best number in the category (~27 ms),
   currently in a `.spec` line below the CTA. Lead with the strongest, hardest-to-fake claim.
3. **Pure monochrome → one meaningful accent.** Introduce cyan that appears *only* on the
   fork primitive (parent VM, the `fork()` call, the "winner"). Color that carries meaning.
4. **Zero social proof → real proof.** No fake logos (correct). Instead: live engine usage
   numbers when available ("N forks executed / p50 27 ms in production"); **GitHub stars baked
   into the nav + a secondary CTA** (Trigger.dev/Inngest pattern — OSS is the strongest early
   trust asset); **one named agent-engineer testimonial with a clickable handle.**
5. **Headline → name-the-objection / division framing** (see Positioning).

**2025–2026 trend guardrails:** dark mode + gradients + Geist are now *table stakes, not
cutting-edge.* Avoid AI-slop tells (purple/blue gradients, generic thick sans, abstract blobs,
rounded-on-rounded, AI imagery). The scarce winning ingredient is taste, restraint, specificity,
and a visible human point of view. **mitos is natively positioned for the agent era — a real
advantage** when every major dev tool just rewrote its hero around agents.

---

## 5. What makes dev brands beloved (the principles we're betting on)

- **With consumers you persuade; with developers you prove.** Every claim must be falsifiable
  and checkable. "Blazing fast" is a vibe to consumers and a *lie detector* to devs — show why.
- **Own a Distinctive Brand Asset and apply it with monotonous consistency** — a color
  (Cloudflare orange, Supabase green), a motion/UI signature (Warp blocks). For mitos: cyan +
  the Division motion. Don't fight the proven page *structure*; own one or two *product-true* assets.
- **The free tier + OSS exit hatch is the strongest trust unlock** for a lock-in-allergic audience.
- **The engineering blog / human changelog IS the go-to-market.** First flagship post: an HN-worthy
  teardown of how the 27 ms / 3 MiB live CoW fork actually works. That post is the marketing budget.
- **Manufacture a recurring moment** — a "Division" ship-burst where the engineer who built each
  feature writes its announcement (Supabase Launch Week, branded to the metaphor).

---

## 6. Toolchain for execution

- **Keep Astro 5 + Starlight** (vanity Go import, OG, docs already wired). Don't adopt a theme —
  a world-class brand can't look like a template. Optionally add Tailwind 4 for velocity.
- **Brand + copy first, code second:** lock positioning via `marketing-skills:product-marketing` →
  `copywriting` → `copy-editing`; audit with `cro`; ship-time `seo-audit` + `schema` + `ai-seo`.
- **Signature animation:** pure SVG/Canvas for the Division (cheapest, zero-dependency, CLS-safe),
  or OGL/tsParticles + GSAP for a richer colony field — lazy-loaded below a static poster.
- `interface-design` skills are explicitly **out of scope for marketing** (their own SKILL.md) —
  reserve for any future in-product console UI.

---

## Honesty constraints (carried from the engine)
- `~27 ms` = warm-claim activate P50 (bare-metal reference node).
- `~3 MiB` = marginal memory per fork via CoW page sharing.
- "swarm" = N-way live CoW fork into independent Ready sandboxes (real engine capability).
- No fabricated customer logos or GitHub star counts. Numbers must stay true to the engine.
