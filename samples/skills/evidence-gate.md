---
name: evidence-gate
always_loaded: false
description: Hypothesis recorded before fix
---

# evidence-gate

Loaded on demand when a debugging session starts. Not preloaded — the cost
of the body outweighs the benefit when most sessions don't debug.

## Procedure

1. State the observed defect with cited artifact.
2. State a single hypothesis naming a file:line.
3. Design one experiment that confirms or denies the hypothesis.
4. Run the experiment, capture the result.
5. Only then propose a fix.
