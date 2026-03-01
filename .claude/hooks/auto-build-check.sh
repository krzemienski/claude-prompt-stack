#!/usr/bin/env bash
# Auto-Build Hook for Claude Code
# Triggers automatically after every source file edit via PostToolUse
# Detects which part of the project was edited and runs the appropriate build
#
# Usage: Called automatically by Claude Code via settings.local.json
#        Can also be run manually: bash .claude/hooks/auto-build-check.sh <file_path>
#
# Exit codes:
#   0 - Build succeeded or file type not tracked
#   1 - Build failed (Claude Code will surface this as an error)

set -euo pipefail

# The file that was just edited (passed by Claude Code hook system)
FILE_PATH="${1:-}"

if [ -z "$FILE_PATH" ]; then
    echo "No file path provided"
    exit 0
fi

# ============================================================================
# CONFIGURATION: Edit these patterns and commands for your project
# ============================================================================

# TypeScript / JavaScript project
build_typescript() {
    echo "Building TypeScript..."
    if command -v npx &>/dev/null && [ -f "tsconfig.json" ]; then
        npx tsc --noEmit 2>&1 | tail -20
    elif command -v npm &>/dev/null && [ -f "package.json" ]; then
        npm run build 2>&1 | tail -20
    else
        echo "No TypeScript build tool found"
        return 0
    fi
}

# Python project
build_python() {
    echo "Checking Python syntax..."
    if command -v mypy &>/dev/null; then
        mypy "$FILE_PATH" 2>&1 | tail -20
    elif command -v python3 &>/dev/null; then
        python3 -m py_compile "$FILE_PATH" 2>&1
    else
        python -m py_compile "$FILE_PATH" 2>&1
    fi
}

# Rust project
build_rust() {
    echo "Checking Rust..."
    if command -v cargo &>/dev/null; then
        cargo check 2>&1 | tail -20
    else
        echo "cargo not found"
        return 1
    fi
}

# Go project
build_go() {
    echo "Building Go..."
    if command -v go &>/dev/null; then
        go build ./... 2>&1 | tail -20
    else
        echo "go not found"
        return 1
    fi
}

# Swift / Xcode project (iOS/macOS)
build_swift() {
    local scheme="${XCODE_SCHEME:-}"
    local destination="${XCODE_DESTINATION:-}"

    if [ -n "$scheme" ] && [ -n "$destination" ]; then
        echo "Building Swift ($scheme)..."
        xcodebuild -scheme "$scheme" -destination "$destination" -quiet 2>&1 | tail -20
    elif command -v swift &>/dev/null && [ -f "Package.swift" ]; then
        echo "Building Swift Package..."
        swift build 2>&1 | tail -20
    else
        echo "No Swift build configuration found"
        return 0
    fi
}

# ============================================================================
# ROUTING: Match file paths to build commands
# ============================================================================

build_result=0

case "$FILE_PATH" in
    # TypeScript / JavaScript
    *.ts|*.tsx|*.js|*.jsx)
        build_typescript || build_result=$?
        ;;

    # Python
    *.py)
        build_python || build_result=$?
        ;;

    # Rust
    *.rs)
        build_rust || build_result=$?
        ;;

    # Go
    *.go)
        build_go || build_result=$?
        ;;

    # Swift
    *.swift)
        build_swift || build_result=$?
        ;;

    # C / C++
    *.c|*.cpp|*.cc|*.h|*.hpp)
        if [ -f "Makefile" ]; then
            echo "Building C/C++..."
            make 2>&1 | tail -20 || build_result=$?
        elif [ -f "CMakeLists.txt" ]; then
            echo "Building with CMake..."
            cmake --build build 2>&1 | tail -20 || build_result=$?
        fi
        ;;

    # Non-source files: no build needed
    *)
        exit 0
        ;;
esac

# Report result
if [ $build_result -ne 0 ]; then
    echo ""
    echo "BUILD FAILED: Fix the errors above before continuing."
    exit 1
else
    echo "Build OK"
    exit 0
fi
