# Project Context (cache-stable prefix)

This file is the stable prefix of every Claude Code session in this project.
The order below is deliberate: stable content first, dynamic content never.
Edit the stable sections rarely. Edit the variable sections never (move that
content to user messages instead).

## Stable section A — Project identity

- Name: <project-name>
- Repo root: <repo-root>
- Primary language: <language>
- Owner: <owner>

## Stable section B — Architecture

<one paragraph describing the system. Edit only when architecture actually changes.>

## Stable section C — Skills available in this project

Every skill on this list loads at SessionStart via `.claude/hooks/session-start-preload.sh`.
The first turn pays cache-creation cost on all of them; turns 2..N read them at the 0.1x rate.

- functional-validation (always loaded — every feature gets validated)
- git-master (always loaded — every commit goes through this)
- agent-browser (always loaded — UI work happens here)
- evidence-gate (always loaded — hypothesis recorded before fix)

## Stable section D — Conventions

- Branch from: <main-branch>
- Commit style: conventional commits, no AI co-author trailer
- Test runner: <runner>
- Lint command: <lint>

## Stable section E — Reference paths

- Source: `src/`
- Tests: `tests/`
- Fixtures: `fixtures/`
- Validation logs: `.validation/`

## Variable content goes elsewhere

Anything that changes per turn — the question being asked, the latest tool
result, the in-flight branch name — belongs in user messages, not here. The
moment dynamic content lands above the cut, every cached turn pays full
creation cost on the prefix.

If you find yourself wanting to update this file mid-session, stop. The change
will invalidate the cache for every subsequent turn. Either commit it at the
end of the session or pass the new fact in as a user message.
