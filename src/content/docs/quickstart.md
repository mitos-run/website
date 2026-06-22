---
title: "Quickstart: run your first mitos sandbox"
description: "Install the mitos SDK, launch a Firecracker microVM sandbox, then fork it into a swarm of isolated subagents in a few lines of Python, TypeScript, or Go."
---

mitos gives your agents isolated, forkable computers. You ask for a warm
microVM, run code in it, and when you need many agents from the same state you
**fork the running VM** into a swarm of daughters that each start warm and share
the parent's memory copy-on-write. This page takes you from install to your
first fork.

## Install

The SDK ships for Python, TypeScript, and a CLI. Pick one:

```bash
pip install mitos          # Python
npm i @mitos/sdk           # TypeScript
go install mitos.run/mitos/cmd/mitos@latest   # CLI
```

## Run a sandbox

A sandbox is a Firecracker microVM with its own kernel. Ask for an image and you
get a running, isolated computer back in milliseconds, because the pool is
already warm and there is no cold start.

```python
from mitos import AgentRun

sb = AgentRun().sandbox("python", ready=True)
result = sb.exec("echo hello from mitos")
print(result.stdout)
```

## Fork it into a swarm

This is the part you cannot do with a plain sandbox. `fork(n)` copies the
**live** VM, memory and processes included, into `n` isolated daughters. Each one
is its own microVM and pays only for the pages it changes (about 3 MiB right
after a fork), so fanning out to hundreds stays cheap.

```python
# divide a running VM into a swarm; each fork is its own microVM
swarm = sb.fork(8)
for agent in swarm:
    agent.exec("python subagent.py")
```

This is what powers best-of-N attempts, RL rollouts, tree search, and
multi-agent evals: branch one warm machine, run every attempt in parallel, then
collapse back to zero.

## Keep what worked

Commit the sandbox that succeeded and throw the rest away. The result is
versioned, and you can fork it again whenever you want.

```python
winner.workspace.commit()
```

## Go

The Go module is published under the vanity import path:

```bash
go get mitos.run/mitos@latest
```

:::note
The vanity import path `mitos.run/mitos` is served by this site (see the
repository README). It is independent of the GitHub org the code is hosted in,
so the hosting location can change without breaking imports.
:::

## Next steps

- Read the [Architecture](/architecture) to see how the fork and isolation work.
- Compare mitos to other sandboxes on the [alternatives](/alternatives) page.
- Run the numbers yourself from the [benchmarks](/benchmarks).
