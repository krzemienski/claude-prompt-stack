# [PROJECT_NAME] — Project Instructions

## Project Context

This is a **[LANGUAGE/FRAMEWORK] project** for [PROJECT_DESCRIPTION].

**Key Paths:**
- `src/` — Application source code
- `tests/` — Test files (if applicable)
- `scripts/` — Build and utility scripts
- `docs/` — Documentation
- `.claude/rules/` — AI agent rules (auto-loaded)
- `.claude/hooks/` — Build and security hooks

**Bundle/Package ID:** `[BUNDLE_ID]`
**Default Port:** [PORT_NUMBER]
**API Prefix:** `[API_PREFIX]`

**Build Commands:**
```bash
# Development build
[BUILD_COMMAND]

# Production build
[PROD_BUILD_COMMAND]

# Run locally
[RUN_COMMAND]
```

---

## Global Rules

### Functional Validation Mandate

**NEVER:** write mocks, stubs, test doubles, or fake implementations when validating features.

**ALWAYS:** build and run the real system. Validate through actual user interfaces or real API calls. Capture evidence (screenshots, logs, curl output) before claiming completion.

### Skill Invocation Mandate

**BEFORE** any task, check available skills. If a skill might apply, invoke it first.
**NEVER** rationalize skipping a skill — skills contain project-specific context you may lack.

### Planning Rules

- Every plan MUST include a validation phase with evidence checkpoints
- Plans describe building and running real systems, not test harnesses

---

## Working Style

### Implement Immediately
When asked to fix or implement something, **start with implementation immediately**. Do NOT spend the entire session in planning/discovery mode reading files repeatedly. Limit exploration to what's strictly necessary, then make changes.

### No Redundant File Reads
Do not re-read files that have already been read in this session unless they have been modified since. Track what you've already analyzed.

### Stay Focused — No Scope Creep
When fixing a specific bug or build error, **stay focused on that issue**. Do NOT escalate into full workspace reorganization, architecture changes, or broad refactoring unless explicitly asked.

### One Change, One Verify
Make a change. Verify it works. Then make the next change. Do not batch 5 changes and then discover 3 of them broke the build.

---

## Build & Verification

### Incremental Build Verification
After ANY code change, run the build command immediately to verify success before moving on. Do not batch multiple changes without build verification.

```bash
# Quick build check
[BUILD_COMMAND] 2>&1 | tail -5
```

### Build Failure Protocol
If a build fails:
1. Read the FULL error output (not just the first error)
2. Fix ALL errors in one pass (errors often cascade)
3. Re-run the build
4. Do NOT introduce new files, reorganize the project, or change build tools as a "fix"

---

## Common Pitfalls

<!-- Add project-specific pitfalls as you discover them -->
- **[PITFALL_1]**: [Description and correct approach]
- **[PITFALL_2]**: [Description and correct approach]
- **[PITFALL_3]**: [Description and correct approach]
