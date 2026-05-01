#!/usr/bin/env bash
# session-start-preload.sh
# Wired as a Claude Code SessionStart hook. On every new session, it walks
# .claude/skills/, picks every skill marked `always_loaded: true`, and emits
# a preload bundle to .claude/.preload-bundle.md. The first turn pays the
# cache-creation tax once; turns 2..N read at 0.1x.

set -euo pipefail

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SKILLS_DIR="${PROJECT_ROOT}/.claude/skills"
OUT_FILE="${PROJECT_ROOT}/.claude/.preload-bundle.md"
STACK_BIN="${CLAUDE_PROMPT_STACK_BIN:-stack}"

if [[ ! -d "${SKILLS_DIR}" ]]; then
  echo "session-start-preload: skills dir missing at ${SKILLS_DIR}; skipping" >&2
  exit 0
fi

if ! command -v "${STACK_BIN}" >/dev/null 2>&1; then
  if command -v bun >/dev/null 2>&1; then
    REPO_ROOT="${CLAUDE_PROMPT_STACK_REPO:-$(dirname "$(dirname "$(realpath "$0")")")}"
    if [[ -f "${REPO_ROOT}/src/cli.ts" ]]; then
      bun run "${REPO_ROOT}/src/cli.ts" preload "${SKILLS_DIR}" --out "${OUT_FILE}"
      echo "session-start-preload: bundle written to ${OUT_FILE}" >&2
      exit 0
    fi
  fi
  echo "session-start-preload: stack CLI not on PATH and bun unavailable; skipping" >&2
  exit 0
fi

"${STACK_BIN}" preload "${SKILLS_DIR}" --out "${OUT_FILE}"
echo "session-start-preload: bundle written to ${OUT_FILE}" >&2
