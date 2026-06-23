---
title: "Architecture: how Mitos forks running microVMs"
description: "How Mitos boots, live-forks, and isolates Firecracker microVM sandboxes: the controller, forkd, the guest agent, and the mitos.run CRDs that drive them."
---

Mitos runs every sandbox as a Firecracker microVM with its own kernel, and its
signature operation is a **live fork** of a running VM: the parent's memory and
processes are copied-on-write into N daughters that resume warm. This page
describes the moving parts that make that possible. Keep it in sync with the
engine repository's `docs/` and `CLAUDE.md` so the public description never
drifts from the code.

## The fork primitive

A traditional sandbox either cold-boots or restores a snapshot for every new
environment. Mitos instead snapshots a *running* microVM once and then forks it:
daughters share the parent's memory pages until they write, so a fork lands in
about 27 ms and adds roughly 3 MiB of marginal memory rather than a whole VM.
Because each daughter is a full microVM, the swarm is isolated agent-from-agent,
not just process-from-process.

## Components

- **controller** (Deployment): reconciles the CRDs, selects nodes, drives forkd.
- **forkd** (DaemonSet): per-node fork daemon; gRPC for the controller, an HTTP
  sandbox API for exec and file traffic.
- **guest agent** (PID 1 in the VM): speaks the vsock protocol for exec, files,
  env, and fork notifications.
- **sandbox-server** (standalone): the same engine behind a plain REST API, no
  Kubernetes required.

## CRDs

The lifecycle is declarative through the `mitos.run` API group:
SandboxTemplate, SandboxPool, SandboxClaim, SandboxFork, and Workspace. A pool
keeps microVMs pre-warmed from a template; a claim hands you a ready VM; a fork
divides a running one into a swarm; a workspace versions the state you choose to
keep.

## Isolation

Each microVM has its own guest kernel and is isolated by KVM, so model-written
code that escalates inside one fork stays inside that disposable VM. It does not
reach the host and it does not reach the other daughters in the swarm.

:::caution
Sandboxes are microVMs, not pods in the raw-forkd path, and pod-native in the
husk path. Describe Kubernetes semantics exactly as the engine proves them in
CI; never imply pod-scoped mechanisms govern a sandbox unless a test shows it.
:::

## See also

- The [Quickstart](/quickstart) for the SDK calls that drive this.
- The [benchmarks](/benchmarks) for reproducible latency and memory numbers.
