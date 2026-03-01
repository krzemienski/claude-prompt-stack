#!/usr/bin/env bash
# Pre-Commit Security Hook for Claude Code
# Scans staged files for secrets, credentials, and sensitive data before commit
#
# Usage: Called automatically by Claude Code via settings.local.json PreToolUse on git commit
#        Can also be run manually: bash .claude/hooks/pre-commit-check.sh
#
# Exit codes:
#   0 - No blocking issues found (warnings may still appear)
#   1 - Blocking issue found (commit should be rejected)

set -euo pipefail

BLOCKED=0
WARNED=0

echo "Running pre-commit security scan..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || echo "")

if [ -z "$STAGED_FILES" ]; then
    echo "No staged files to scan."
    exit 0
fi

# ============================================================================
# BLOCKING CHECKS: These prevent the commit entirely
# ============================================================================

for file in $STAGED_FILES; do
    # Skip binary files
    if file "$file" 2>/dev/null | grep -q "binary"; then
        continue
    fi

    # Skip if file doesn't exist (deleted files)
    if [ ! -f "$file" ]; then
        continue
    fi

    # --- Check for API keys ---

    # OpenAI / Anthropic API keys
    if grep -nE 'sk-[a-zA-Z0-9]{20,}' "$file" 2>/dev/null; then
        echo "BLOCKED: Possible API key found in $file"
        BLOCKED=1
    fi

    # AWS Access Keys
    if grep -nE 'AKIA[A-Z0-9]{16}' "$file" 2>/dev/null; then
        echo "BLOCKED: AWS access key found in $file"
        BLOCKED=1
    fi

    # GitHub tokens
    if grep -nE '(ghp_|ghu_|ghs_|gho_|ghr_)[a-zA-Z0-9]{36,}' "$file" 2>/dev/null; then
        echo "BLOCKED: GitHub token found in $file"
        BLOCKED=1
    fi

    # GitLab tokens
    if grep -nE 'glpat-[a-zA-Z0-9\-]{20,}' "$file" 2>/dev/null; then
        echo "BLOCKED: GitLab token found in $file"
        BLOCKED=1
    fi

    # Generic Bearer tokens (hardcoded)
    if grep -nE 'Bearer [a-zA-Z0-9_\-\.]{20,}' "$file" 2>/dev/null; then
        echo "BLOCKED: Hardcoded Bearer token found in $file"
        BLOCKED=1
    fi

    # Private keys
    if grep -nE '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' "$file" 2>/dev/null; then
        echo "BLOCKED: Private key found in $file"
        BLOCKED=1
    fi
done

# --- Check for sensitive file types ---

for file in $STAGED_FILES; do
    case "$file" in
        *.sqlite|*.sqlite3|*.db)
            echo "BLOCKED: Database file staged for commit: $file"
            BLOCKED=1
            ;;
        .env|.env.*|*.env)
            echo "BLOCKED: Environment file staged for commit: $file"
            BLOCKED=1
            ;;
        *.pem|*.key|*.p12|*.pfx)
            echo "BLOCKED: Certificate/key file staged for commit: $file"
            BLOCKED=1
            ;;
    esac
done

# ============================================================================
# WARNING CHECKS: These warn but don't block
# ============================================================================

for file in $STAGED_FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    # Skip binary files
    if file "$file" 2>/dev/null | grep -q "binary"; then
        continue
    fi

    # Hardcoded absolute paths
    if grep -nE '/Users/[a-zA-Z]|/home/[a-zA-Z]' "$file" 2>/dev/null; then
        echo "WARNING: Hardcoded absolute path in $file (consider using relative paths)"
        WARNED=1
    fi

    # Hardcoded passwords
    if grep -niE '(password|passwd|pwd)\s*=\s*"[^"]+"|password\s*:\s*"[^"]+"' "$file" 2>/dev/null; then
        echo "WARNING: Possible hardcoded password in $file"
        WARNED=1
    fi

    # TODO/FIXME/HACK markers (informational)
    if grep -ncE '(TODO|FIXME|HACK|XXX):' "$file" 2>/dev/null | grep -v '^0$' >/dev/null; then
        count=$(grep -cE '(TODO|FIXME|HACK|XXX):' "$file" 2>/dev/null || echo "0")
        echo "INFO: $count TODO/FIXME markers in $file"
    fi
done

# ============================================================================
# RESULT
# ============================================================================

echo ""
if [ $BLOCKED -ne 0 ]; then
    echo "SECURITY SCAN FAILED: Commit blocked due to sensitive data."
    echo "Remove the flagged content and try again."
    exit 1
elif [ $WARNED -ne 0 ]; then
    echo "Security scan passed with warnings. Review the warnings above."
    exit 0
else
    echo "Security scan passed. No issues found."
    exit 0
fi
