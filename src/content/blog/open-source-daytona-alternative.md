---
title: "The open source Daytona alternative for running AI code"
description: "Daytona moved its runtime to a private codebase. Mitos is the open source, self-hostable alternative for running AI-generated code in Firecracker microVMs."
date: 2026-06-28
category: engineering
tags: ["daytona alternative", "open source", "self-hostable", "AI sandbox", "Firecracker microVM", "code interpreter", "drop-in"]
author: "Mitos team"
faqs:
  - q: "What is the open source alternative to Daytona?"
    a: "Mitos. It runs AI-generated code in secure, elastic Firecracker microVM sandboxes, the same job Daytona's open repository did, but the engine is Apache-2.0 and self-hostable on any KVM Kubernetes cluster. The benchmark scripts ship in the repository so every performance number is one you can reproduce."
  - q: "Is Daytona still open source?"
    a: "No. As of June 2026 the daytonaio/daytona repository states it is no longer maintained and that core development has moved to a private codebase, with no further updates, fixes, or releases. The old code stays public to fork, but the runtime you would build on day to day is closed."
  - q: "Is Mitos a drop-in replacement for Daytona?"
    a: "Yes. Mitos ships a one-import Daytona shim: change from daytona import Daytona to from mitos.daytona import Daytona and your script runs against a self-hosted Mitos server. It mirrors Daytona's surface, daytona.create(), sandbox.process.exec and code_run, sandbox.fs file operations, get_preview_link, and start/stop, mapped onto the native engine. There is a matching one-import shim for E2B."
  - q: "Can I self-host Mitos?"
    a: "Yes, and self-host is a first-class path, not a teaser. The engine runs on any KVM Kubernetes cluster under Apache-2.0. There is also a managed cloud at mitos.run for teams who would rather not operate microVMs themselves."
  - q: "Is it secure to run untrusted, model-written code on Mitos?"
    a: "Each sandbox is a Firecracker microVM with its own kernel under KVM, not a shared-kernel container. Code you do not fully trust stays inside one disposable machine, forks do not silently inherit secrets, and egress is default-deny."
  - q: "How fast is Mitos, and what does a fork cost?"
    a: "On the reference node, Mitos activates a warm fork in about 27 ms, restores a snapshot in 6 to 16 ms, and adds about 3 MiB of memory per fork through copy-on-write page sharing. Those are reproducible engine measurements from the repository's benchmark scripts."
  - q: "Will Mitos also go closed source later?"
    a: "The engine is Apache-2.0, a license that cannot be revoked on code already released, so the runtime you self-host stays yours. Mitos monetizes a managed cloud, not by closing the runtime you depend on."
---

Mitos is the open source, self-hostable alternative to Daytona for running AI-generated code. It gives you the same job Daytona's open repository did, secure and elastic sandboxes for executing code your agents write, on infrastructure you control, under an Apache-2.0 license that cannot be taken back. If you adopted Daytona because it was open, this is where that path continues.

**The short version:**

- Daytona's runtime moved to a private codebase. The public repo is unmaintained, with no further updates, fixes, or releases.
- Mitos runs AI-generated code in per-agent **Firecracker microVMs**, **open source under Apache-2.0**, **self-hostable** on any KVM Kubernetes cluster, with a managed cloud at [mitos.run](https://mitos.run).
- Migration is a **one-import drop-in**: `from mitos.daytona import Daytona` (and the same for E2B).
- A primitive Daytona does not have: **fork a running microVM** into many warm copies in place.

## What changed with Daytona

Daytona did a lot right. It made running AI-generated code feel like infrastructure instead of a science project, and a real community grew around a repository people could read, fork, and run themselves.

That last part is the part that went away. The [daytonaio/daytona repository](https://github.com/daytonaio/daytona) now opens with a notice, and the team explained the move in [Daytona is going closed source](https://www.daytona.io/dotfiles/updates/daytona-is-going-closed-source):

> This repository is no longer maintained. As of June 2026, Daytona's core development has moved to a private codebase. This repository will receive no further updates, fixes, or releases.

The promise on the page is still there, "Run AI Code. Secure and Elastic Infrastructure for Running Your AI-Generated Code." The open project behind it is not. "Open" was never only a license. For a component whose entire job is to run code you do not fully trust, it was a guarantee about who can audit it, patch it, pin it, and run it on their own hardware. When that guarantee moves behind a private door, the dependency changes shape.

## The same job, still open

Mitos exists to do that job, and to keep doing it in the open.

- **Secure.** Each piece of AI-generated code runs in its own [Firecracker](https://github.com/firecracker-microvm/firecracker) microVM with its own kernel under [KVM](https://www.linux-kvm.org), not a shared-kernel container. A prompt injection that turns into a shell stays inside one disposable machine, and egress is default-deny.
- **Elastic.** Create sandboxes programmatically, run code, snapshot, and tear down, from a single host or a Kubernetes pool.
- **Open and yours.** The [engine](https://github.com/mitos-run/mitos) is **Apache-2.0** and self-hostable on any KVM Kubernetes cluster. The benchmark scripts are in the repository, so the claims are something you run, not something you take on faith.

## Daytona vs Mitos

| | Daytona | Mitos |
|---|---|---|
| Runtime source | Closed, private codebase | **Open, Apache-2.0** |
| Public repo status | Unmaintained, no releases | Actively developed |
| Self-host | No path at equivalent capability | **First-class, any KVM Kubernetes cluster** |
| Isolation | Sandbox | **Firecracker microVM, own kernel** |
| Fan out N agents | Cold creates from a snapshot | **Live fork of a warm machine, copy-on-write** |
| Reproducible benchmarks | Vendor-published | **Scripts in the repo** |
| Managed cloud | Yes | Yes, at [mitos.run](https://mitos.run) |
| Lock-in | Proprietary runtime | **License cannot be revoked** |

For the full head-to-head across forking, isolation, speed, cost, and license, see the [Daytona vs Mitos comparison](/compare/daytona). For where every option lands, including E2B, Modal, and Morph, read the [AI agent sandbox landscape](/alternatives).

## Migration is a small change, not a rewrite

Coming from Daytona, it is literally one import. Mitos ships a Daytona-compatible shim that mirrors the client and `Sandbox` surface, `daytona.create()`, `sandbox.process.exec` and `code_run`, `sandbox.fs` file operations, `get_preview_link`, and `start` / `stop`, over a self-hosted Mitos server:

```python
# before
from daytona import Daytona, CreateSandboxFromSnapshotParams
# after
from mitos.daytona import Daytona, CreateSandboxFromSnapshotParams

daytona = Daytona()
sandbox = daytona.create(CreateSandboxFromSnapshotParams(language="python"))
sandbox.process.code_run("print(1 + 1)")     # the rest of your code is unchanged
```

Under the hood it is an adapter over the native engine, not a re-implementation, with no dependency on the `daytona` package. Daytona's `start` / `stop` map onto the native `resume` / `pause`. Leaving E2B instead? There is a matching one-import shim, `from mitos.e2b import Sandbox` ([migration guide](/docs/migrating-from-e2b)). The same create, exec, snapshot, and file primitives are also available through a built-in [MCP server](https://modelcontextprotocol.io) and adapters for the [Claude Agent SDK](https://docs.anthropic.com), the [OpenAI Agents SDK](https://github.com/openai/openai-agents-python), and [LangChain](https://www.langchain.com).

## One thing Daytona could not do: fork a running machine

Instead of booting a clean machine per agent, Mitos can fork a warm, mid-task one. The live memory and processes of a running microVM are copied on write into N daughters, each its own isolated microVM that resumes already warm and only pays for the pages it changes. The mental model is the [`fork()` system call](https://man7.org/linux/man-pages/man2/fork.2.html) applied to a whole machine: one warm base becomes many independent copies, not many cold boots.

```python
import mitos

sb = mitos.create("python")              # a warm sandbox
sb.files.write("/workspace/plan.txt", "draft")

forks = sb.fork(8)                       # eight isolated copies, each already warm
for f in forks:
    f.exec("python attempt.py")          # run a different attempt in each
```

That is exactly what best-of-N attempts, evals, tree search, and [parallel RL rollouts](/use-cases/rollouts) need, and it is the difference between paying for one warm environment and re-paying for it on every run. We go deeper on the primitive in [fork a running microVM: run AI agents in parallel](/blog/fork-dont-rebuild).

## Numbers you can reproduce

On the reference node, Mitos activates a warm fork in about **27 ms**, restores a snapshot in **6 to 16 ms**, and adds about **3 MiB** of memory per fork through copy-on-write page sharing.

Every figure is reproducible from the benchmark scripts in the repository. They are engine measurements on bare metal, not end-to-end wall-clock times or a matched head-to-head against other vendors, and we label them that way on the [benchmarks](/benchmarks) page. That openness is the point: an alternative you can verify is worth more than one you have to trust.

## We are not going to pull the rug

The engine is Apache-2.0. That license cannot be revoked on code already released, so the runtime you self-host today stays yours no matter what happens to the company. Mitos makes money on a managed cloud for teams who would rather not operate microVMs themselves, not by closing the part you depend on. Open is the product decision, not the marketing.

## Run it today

- **Managed cloud:** start on [mitos.run](https://mitos.run), no infrastructure to operate. See [pricing](/pricing).
- **Self-host:** the [engine on GitHub](https://github.com/mitos-run/mitos) is Apache-2.0 and runs on any KVM Kubernetes cluster.
- **Try the primitive:** the [quickstart](/docs/quickstart) forks a sandbox in a few lines.

Same promise Daytona made, secure and elastic infrastructure for running your AI-generated code. The difference is that this one stays open, and it stays yours.
