#!/usr/bin/env bash
# Claude Prompt Stack — One-Command Setup
# Creates the full 7-layer defense-in-depth prompt engineering system
#
# Usage:
#   bash setup.sh                    # Interactive setup in current directory
#   bash setup.sh --target ./myapp   # Setup in specific directory
#   bash setup.sh --dry-run          # Preview what would be created

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Defaults
TARGET_DIR="."
DRY_RUN=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target)
            TARGET_DIR="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: bash setup.sh [--target DIR] [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --target DIR   Install into DIR (default: current directory)"
            echo "  --dry-run      Preview what would be created"
            echo "  -h, --help     Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   Claude Prompt Stack — Setup Wizard     ║"
echo "  ║   7-Layer Defense-in-Depth System        ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Resolve target
TARGET_DIR="$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")"
echo -e "${BLUE}Target directory:${NC} $TARGET_DIR"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN — showing what would be created:${NC}"
    echo ""
fi

# Track what we create
CREATED=0
SKIPPED=0

create_file() {
    local dest="$1"
    local src="$2"
    local full_dest="$TARGET_DIR/$dest"

    if [ "$DRY_RUN" = true ]; then
        if [ -f "$full_dest" ]; then
            echo -e "  ${YELLOW}SKIP${NC}  $dest (already exists)"
            SKIPPED=$((SKIPPED + 1))
        else
            echo -e "  ${GREEN}CREATE${NC} $dest"
            CREATED=$((CREATED + 1))
        fi
        return
    fi

    # Create parent directory
    mkdir -p "$(dirname "$full_dest")"

    if [ -f "$full_dest" ]; then
        echo -e "  ${YELLOW}SKIP${NC}  $dest (already exists)"
        SKIPPED=$((SKIPPED + 1))
    else
        cp "$src" "$full_dest"
        echo -e "  ${GREEN}CREATE${NC} $dest"
        CREATED=$((CREATED + 1))
    fi
}

create_dir() {
    local dir="$1"
    local full_dir="$TARGET_DIR/$dir"

    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${BLUE}MKDIR${NC}  $dir/"
        return
    fi

    mkdir -p "$full_dir"
}

# ============================================================================
# Layer 1 & 2: CLAUDE.md files
# ============================================================================
echo -e "${CYAN}Layer 1-2: CLAUDE.md (Project Instructions)${NC}"
create_file "CLAUDE.md" "$SCRIPT_DIR/CLAUDE.md"
echo ""

# ============================================================================
# Layer 3: Rules files
# ============================================================================
echo -e "${CYAN}Layer 3: Rules Files (.claude/rules/)${NC}"
create_dir ".claude/rules"

for rule_file in "$SCRIPT_DIR"/.claude/rules/*.md; do
    if [ -f "$rule_file" ]; then
        basename=$(basename "$rule_file")
        create_file ".claude/rules/$basename" "$rule_file"
    fi
done
echo ""

# ============================================================================
# Layer 4: Auto-Build Hook
# ============================================================================
echo -e "${CYAN}Layer 4: Auto-Build Hook (.claude/hooks/)${NC}"
create_dir ".claude/hooks"
create_file ".claude/hooks/auto-build-check.sh" "$SCRIPT_DIR/.claude/hooks/auto-build-check.sh"

if [ "$DRY_RUN" = false ] && [ -f "$TARGET_DIR/.claude/hooks/auto-build-check.sh" ]; then
    chmod +x "$TARGET_DIR/.claude/hooks/auto-build-check.sh"
fi
echo ""

# ============================================================================
# Layer 5: Pre-Commit Security Hook
# ============================================================================
echo -e "${CYAN}Layer 5: Pre-Commit Security Hook${NC}"
create_file ".claude/hooks/pre-commit-check.sh" "$SCRIPT_DIR/.claude/hooks/pre-commit-check.sh"

if [ "$DRY_RUN" = false ] && [ -f "$TARGET_DIR/.claude/hooks/pre-commit-check.sh" ]; then
    chmod +x "$TARGET_DIR/.claude/hooks/pre-commit-check.sh"
fi

# Hook configuration
create_file ".claude/settings.local.json" "$SCRIPT_DIR/.claude/settings.local.json"
echo ""

# ============================================================================
# Layer 6: Skills
# ============================================================================
echo -e "${CYAN}Layer 6: Skills${NC}"
create_dir "skills"

for skill_file in "$SCRIPT_DIR"/skills/*.md; do
    if [ -f "$skill_file" ]; then
        basename=$(basename "$skill_file")
        create_file "skills/$basename" "$skill_file"
    fi
done
echo ""

# ============================================================================
# Layer 7: Project Memory
# ============================================================================
echo -e "${CYAN}Layer 7: Project Memory (MEMORY.md)${NC}"
create_file "MEMORY.md" "$SCRIPT_DIR/MEMORY.md"
echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${CYAN}═══════════════════════════════════════════${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}Dry run complete.${NC}"
    echo -e "  Would create: ${GREEN}$CREATED files${NC}"
    echo -e "  Would skip:   ${YELLOW}$SKIPPED files${NC} (already exist)"
    echo ""
    echo "Run without --dry-run to apply."
else
    echo -e "${GREEN}Setup complete!${NC}"
    echo -e "  Created: ${GREEN}$CREATED files${NC}"
    echo -e "  Skipped: ${YELLOW}$SKIPPED files${NC} (already existed)"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Edit CLAUDE.md — replace [PLACEHOLDER] values with your project info"
    echo "  2. Edit .claude/rules/project.md — fill in your tech stack and paths"
    echo "  3. Edit .claude/hooks/auto-build-check.sh — configure your build commands"
    echo "  4. Update MEMORY.md as you work with Claude Code"
    echo ""
    echo -e "${CYAN}The 7-layer prompt stack is ready. Start a Claude Code session to use it.${NC}"
fi
