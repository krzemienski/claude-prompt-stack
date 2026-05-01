# claude-prompt-stack

Keep your Claude Code prompt prefix stable across sessions so the cache pays
you back. Ships a SessionStart preloader, a JSONL cache-health parser, and a
CLAUDE.md template that front-loads stable context.

> **Why this exists.** I built this after my third month of bad cache hygiene.
> Companion code for the blog post
> [Prompt Caching Economics](https://withagents.dev/posts/post-23-prompt-caching-economics).
> Read the post first. The repo is the executable version of the spec.

## The rule the cache cares about

The Anthropic Messages API hashes your prompt prefix from byte zero forward.
The hash hits everything from position 0 up to the first byte that diverges
from a previously-seen prompt. Anything that changes between turns has to
come at the END. Anything stable goes at the START. Cache reads cost 0.1x;
cache writes cost 1.25x. The math: a cached 20K-token prefix saves ~78% of
your input bill across a 60-turn session.

This repo gives you three things to claim that discount:

| Tool | Purpose |
|------|---------|
| `templates/CLAUDE.md` | A stable-prefix project template you can drop in |
| `src/preloader.ts` | Walks `.claude/skills/*.md`, picks `always_loaded: true`, emits a single bundle for SessionStart |
| `src/cache-health.ts` | Walks JSONL session files, computes per-session read ratios |
| `src/cli.ts` | `stack` CLI: `init` scaffolds, `analyze` reports, `preload` renders bundles |
| `hooks/session-start-preload.sh` | Wire the preloader as a Claude Code SessionStart hook |

## Install

```bash
git clone https://github.com/krzemienski/claude-prompt-stack
cd claude-prompt-stack
bun install
bun test
```

You need [Bun](https://bun.sh) 1.1+. No other runtime deps.

## Quickstart

### Analyze your own sessions

```bash
bun run src/cli.ts analyze ~/.claude/projects/<project-id>/<session>.jsonl --pretty
```

Output is JSON with `turns`, `creationTotal`, `readsTotal`, `readRatio`, and
a `health` classification (`healthy`, `mediocre`, `unhealthy`, `empty`).
Healthy sessions have `readRatio >= 0.85`. Unhealthy sessions sit below 0.5.

```bash
# Aggregate every session for a project
bun run src/cli.ts analyze ~/.claude/projects/<project-id>/
```

### Scaffold a stable prefix into a project

```bash
bun run src/cli.ts init --target /path/to/your/project
```

This drops `CLAUDE.md` at the project root, copies the example always-loaded
skills into `.claude/skills/`, and installs the SessionStart hook script at
`.claude/hooks/session-start-preload.sh`. Edit the placeholders, wire the
hook into your `~/.claude/settings.json`, and your next session pre-loads
every skill in alphabetical order on turn 1.

### Render a preload bundle without scaffolding

```bash
bun run src/cli.ts preload ./.claude/skills --out ./.claude/.preload-bundle.md
```

Returns JSON with skill count, estimated creation tokens, and a break-even
turn count (typically 2 or 3 — the math from the post).

## Command reference

| Command | Args | Purpose |
|---------|------|---------|
| `stack init` | `--target <dir>` | Scaffold `CLAUDE.md` + `.claude/skills/` + hook |
| `stack analyze` | `<jsonl-or-dir> [--pretty]` | Print JSON cache-health report |
| `stack preload` | `<skills-dir> [--out <file>]` | Render preload bundle from skills dir |
| `stack help` | — | Show help |

Exit codes: `0` success, `1` runtime error, `2` usage error.

## Repo layout

```
src/
  cache-health.ts   JSONL parser, per-session and corpus reports
  preloader.ts      Skill manifest builder, bundle renderer
  cli.ts            Bun-based CLI (init, analyze, preload)
templates/
  CLAUDE.md         Stable-prefix project template
hooks/
  session-start-preload.sh   SessionStart hook script
samples/
  sessions/         Three sample JSONL sessions
  skills/           Four sample skills (3 always-loaded, 1 lazy)
tests/              bun:test suite
.validation/        Captured validation output
```

## What this repo will NOT do

- It will not run on your live API key. Sample JSONL ships with the repo.
- It will not write a Claude Code config for you. The hook script is
  copied in; wiring it into `~/.claude/settings.json` is your call.
- It will not break-even immediately. Pre-loading skills costs 1.25x on
  turn 1. The savings show up by turn 3 and accumulate from there.

## Related reading

- Post: [Prompt Caching Economics](https://withagents.dev/posts/post-23-prompt-caching-economics)
- Anthropic prompt caching docs: <https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching>

## License

MIT, see `LICENSE`.
