---
title: Quickstart
description: Install the mitos SDK and run your first sandbox.
---

This is a scaffold page. Fill it in from the engine repository's README and SDK
docs so that every snippet here is runnable against the real API.

## Install

```bash
pip install mitos
```

## Run a sandbox

```python
from mitos import AgentRun

sbx = AgentRun().sandbox("python")
result = sbx.exec("echo hello from mitos")
print(result.stdout)
```

## Go

The Go module is published under the vanity import path:

```bash
go get mitos.run/mitos@latest
```

```go
import "mitos.run/mitos/..."
```

:::note
The vanity import path `mitos.run/mitos` is served by this site (see the
repository README). It is independent of the GitHub org the code is hosted in,
so the hosting location can change without breaking imports.
:::
