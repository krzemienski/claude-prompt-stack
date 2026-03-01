# Auto-Build Hook

**Every source file edit automatically triggers a build check.** This is configured via `.claude/settings.local.json`.

## How It Works

| Hook | Trigger | Action |
|------|---------|--------|
| `PostToolUse` | Edit/Write/MultiEdit on source files | Runs `auto-build-check.sh` (up to 120s) |
| `PreToolUse` | `git commit` bash command | Runs `pre-commit-check.sh` (security scan) |

## Auto-Build Behavior

The hook detects which part of the project was edited and builds accordingly:

```
src/**/*.ts      → npm run build / tsc --noEmit
src/**/*.py      → python -m py_compile / mypy
src/**/*.swift   → xcodebuild / swift build
src/**/*.rs      → cargo check
src/**/*.go      → go build ./...
Other files      → no build triggered
```

**If the build fails**, the hook outputs `BUILD FAILED: <errors>` and exits 1. Claude Code will surface this as a hook error — **you must fix the build before continuing**.

## Pre-Commit Security Scan

Before every `git commit`, the hook scans staged files for:
- Hardcoded absolute paths like `/Users/` or `/home/` (warning)
- API key patterns: `sk-*`, `AKIA*`, `ghp_*`, `Bearer *` (blocked)
- Database files `.sqlite`, `.db` staged for commit (blocked)
- `.env` files staged for commit (blocked)

## Implications for AI Sessions

- **Do NOT manually run builds after every edit** — the hook does it automatically
- **Do NOT batch multiple edits hoping to build at the end** — each edit triggers a build
- **If hook fires BUILD FAILED** — fix the error immediately, don't continue editing
- **Build time budget**: Each auto-build takes 5-45s depending on project size
- **Non-source changes** (JSON, Markdown, assets) do NOT trigger auto-build
