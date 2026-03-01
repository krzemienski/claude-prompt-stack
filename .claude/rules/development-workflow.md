# Development Workflow

> This file defines the feature development process that happens before git operations.
> For commit format and PR workflow, see [git-workflow.md](./git-workflow.md).

## Feature Implementation Workflow

### 1. Plan First
- Use the **planner** agent to create an implementation plan
- Identify dependencies and risks
- Break down into manageable phases
- Every plan MUST include a functional validation phase with evidence checkpoints

### 2. Build & Validate (Functional Validation)
- Build the real system — no mocks, no stubs, no test files
- Run the application in its actual environment
- Exercise the feature through the real UI or API
- Capture screenshots, logs, or API responses as evidence
- Verify behavior matches the plan's expected outcomes

### 3. Code Review
- Use the **code-reviewer** agent immediately after writing code
- Address all CRITICAL and HIGH severity issues before proceeding
- Fix MEDIUM issues when possible
- Document any intentionally deferred LOW issues

### 4. Commit & Push
- Write detailed commit messages following conventional format
- Include validation evidence references in commit body when relevant
- See [git-workflow.md](./git-workflow.md) for commit format and PR process

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Do This Instead |
|-------------|--------------|-----------------|
| Planning without executing | Burns context window, no value delivered | Plan once, then execute |
| Skipping validation | "It should work" is not evidence | Always verify with real system |
| Batching too many changes | Hard to isolate failures | One change, one verify |
| Reading files repeatedly | Wastes context budget | Read once, track what you know |
| Scope creep during bug fixes | Simple fix becomes refactor | Fix the bug, move on |
