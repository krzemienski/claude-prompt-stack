---
name: git-master
always_loaded: true
description: Atomic commits, conventional style, no force-push to main
---

# git-master

Every commit in this project goes through this skill.

## Rules

- Conventional commits: `<type>: <subject>`. Types: feat, fix, refactor, docs, chore, perf, ci.
- Stage specific files. Never `git add -A` (catches secrets and large binaries).
- Never amend a published commit. Never force-push main/master.
- HTTPS remote. Inspect `git remote -v` before push.
- No AI co-author trailer.

## Workflow

1. `git status` — confirm what changed.
2. `git diff --staged` — read the actual diff.
3. Compose subject line (≤72 chars). Body explains *why*.
4. `git commit` (no `--no-verify`).
5. Push to feature branch with `-u`.
