---
name: functional-validation
always_loaded: true
description: Real-system validation, no mocks
---

# functional-validation

Validate features by running them against the real system, not against mocks.

## Rules

- No mocks, no stubs, no test doubles, no fake data.
- Build the real artifact. Run it. Capture the output.
- Cite specific evidence (logs, screenshots, stdout) for every PASS verdict.
- Compilation success is necessary but not sufficient.

## Procedure

1. Build the system in production-like mode.
2. Exercise the user-visible flow end-to-end.
3. Capture artifacts to `.validation/`.
4. Mark complete only when artifacts exist and a skeptical reviewer would agree.
