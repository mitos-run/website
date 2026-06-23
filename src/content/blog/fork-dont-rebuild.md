---
title: "Fork a running microVM: run AI agents in parallel"
description: "Why forking a running Firecracker microVM beats rebuilding a sandbox per agent, how it runs AI agents in parallel, and what you can build with it."
date: 2026-06-23
category: engineering
tags: ["fork", "microVM", "agent swarms", "best-of-N", "isolation"]
author: "Mitos team"
faqs:
  - q: "What does it mean to fork a running microVM?"
    a: "Forking copies a warm, running microVM, its memory and processes, into one or more isolated copies in place, instead of booting a fresh machine. Each copy resumes already warm and then diverges on its own. It is closer to the fork() system call than to starting a new VM."
  - q: "How is forking a microVM different from a snapshot?"
    a: "A snapshot saves a machine's state so you can restore it later, usually one lineage at a time. A live fork copies a running machine into many divergent copies at once, sharing memory copy-on-write. Snapshots are save-and-reload; a fork is branch-in-place."
  - q: "Is it secure to run untrusted agent code this way?"
    a: "Each fork is a Firecracker microVM with its own kernel under KVM, not a shared-kernel container. Model-written code you do not fully trust stays inside one disposable machine, forks do not silently inherit secrets, and egress is default-deny."
  - q: "How fast is a fork, and how much memory does it use?"
    a: "On the reference node, Mitos activates a warm fork in about 27 ms and adds about 3 MiB of memory per fork through copy-on-write page sharing. Those are reproducible engine measurements from the repository's benchmark scripts, not end-to-end wall-clock numbers."
  - q: "Can I use it with Claude, LangChain, or the OpenAI Agents SDK?"
    a: "Yes. Mitos ships adapters for the Claude Agent SDK, the OpenAI Agents SDK, and LangChain, plus an MCP server that exposes create, exec, fork, and file tools. Teams on E2B can switch with a one-import migration shim."
  - q: "Is Mitos open source?"
    a: "Yes. The engine is Apache-2.0 and self-hostable on any KVM Kubernetes cluster, and the benchmark scripts are in the repository so you can reproduce the numbers. A managed cloud is coming."
---

Forking a running microVM copies a warm, mid-task machine into many isolated copies in place, instead of booting a fresh one for each. For AI agents, that turns one prepared environment into a fleet that all start from the same live state. Mitos is built around this fork.

## Why a fresh sandbox per agent is the bottleneck

Most agent sandboxes create a clean machine per agent, which is exactly right for a single run. The cost shows up the moment you need many agents from the same point: best-of-N attempts, evals, tree search, or parallel tool calls.

Boot each from scratch and you re-pay for the whole environment every time, the base image, the dependencies, and the warmed-up state your agent already built. The work you just did does not carry over to the next attempt.

## What it means to fork a running microVM

Mitos forks the running machine instead. The live memory and processes of a warm [Firecracker](https://github.com/firecracker-microvm/firecracker) microVM are copied on write into N daughters, each its own microVM with its own kernel under [KVM](https://www.linux-kvm.org). A daughter resumes already warm and only pays for the pages it changes, so the marginal cost of one more agent stays small.

The mental model is the [`fork()` system call](https://man7.org/linux/man-pages/man2/fork.2.html), applied to a whole machine: one warm base becomes a thousand independent copies, not a thousand cold boots.

## Forking vs rebuilding vs snapshots

| Approach | What it does | When you fan out N agents |
|---|---|---|
| Rebuild a fresh sandbox | Boots a clean machine per agent | You re-pay for image, dependencies, and warm-up every time |
| Snapshot and restore | Saves one machine's state, reloads it later | Restores one lineage, not N divergent live copies |
| Live fork (Mitos) | Copies a running machine into N copy-on-write daughters | Each daughter starts warm; you pay about 3 MiB per fork |

Snapshots and fresh sandboxes are useful, and several tools do them well. The gap they leave is branching a *running* machine into many copies at once, which is the operation fan-out workloads actually need.

## What you can build with it

- **Best-of-N and parallel attempts.** Warm one base, fork it, run a different attempt in each copy, keep the winner, discard the rest.
- **Running untrusted, model-written code.** Each agent gets its own kernel, so a prompt injection that turns into a shell stays inside one disposable machine.
- **A stateful code interpreter.** Run code in a session that keeps its state between calls, then fork the session to explore branches.
- **Durable, forkable agent workspaces.** Commit a workspace, fork it, and resume the lineage later instead of starting over.
- **Hosting a coding-agent harness.** Run an agent daemon inside a sandbox and reach it over a port.

The same primitive is a natural fit for RL rollouts, agentic tree search, and large evaluation sweeps: anywhere you launch many trajectories from one shared starting state.

## How it works in code

```python
import mitos

sb = mitos.create("python")              # a warm sandbox
sb.files.write("/workspace/plan.txt", "draft")

forks = sb.fork(8)                       # eight isolated copies, each already warm
for f in forks:
    f.exec("python attempt.py")          # run a different attempt in each
```

Each fork is independent: a write in one is invisible to the others. The same `fork(n)` call works from a single host or against a Kubernetes pool.

## Works with your agent stack

Mitos ships adapters for the tools agent teams already use. The [**Claude Agent SDK**](https://docs.anthropic.com), the [**OpenAI Agents SDK**](https://github.com/openai/openai-agents-python), and [**LangChain**](https://www.langchain.com) can drive sandboxes directly, and the built-in [**MCP server**](https://modelcontextprotocol.io) exposes create, exec, fork, and file operations as tools any MCP-aware agent can call. Already on E2B? A migration shim lets you switch with a one-line import change.

## Open source, with numbers you can run

The [engine](https://github.com/mitos-run/mitos) is **Apache-2.0** and self-hostable on any KVM Kubernetes cluster, so the fork is something you can read, run, and verify rather than a black box. On the reference node it activates a warm fork in about **27 ms**, restores a snapshot in **6 to 16 ms**, and adds about **3 MiB** of memory per fork.

Every figure is reproducible from the benchmark scripts in the repository. They are engine measurements on bare metal, not end-to-end wall-clock times or a matched head-to-head against other vendors, and we label them that way on the [benchmarks](/benchmarks) page.

Run it today: the [quickstart](/quickstart) forks a sandbox in a few lines, and a managed cloud is coming. Release-by-release shipping notes live on the [changelog](https://github.com/mitos-run/mitos/releases).
