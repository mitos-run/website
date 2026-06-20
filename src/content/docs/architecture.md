---
title: Architecture
description: How mitos boots, forks, and exposes microVM sandboxes.
---

This is a scaffold page. Keep it in sync with the engine repository's
`docs/` and `CLAUDE.md` so the public description never drifts from the code.

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
SandboxTemplate, SandboxPool, SandboxClaim, SandboxFork, and Workspace.

:::caution
Sandboxes are microVMs, not pods in the raw-forkd path, and pod-native in the
husk path. Describe Kubernetes semantics exactly as the engine proves them in
CI; never imply pod-scoped mechanisms govern a sandbox unless a test shows it.
:::
