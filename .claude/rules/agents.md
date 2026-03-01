# Agent Orchestration

## Available Agents

Define the specialized agents your AI assistant can delegate to. Each agent has a focused purpose and clear trigger conditions.

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, multi-step refactoring |
| architect | System design decisions | Architectural changes, new subsystems |
| code-reviewer | Code quality review | After writing or modifying code |
| security-reviewer | Security analysis | Before commits, auth changes, API endpoints |
| build-fixer | Fix build errors | When build fails |
| refactor-cleaner | Dead code cleanup | Code maintenance, dependency removal |
| doc-updater | Documentation | Updating READMEs, API docs, guides |

## Immediate Agent Usage

These agents should be invoked automatically without waiting for user prompts:

1. **Complex feature requests** — Use **planner** agent to break down work
2. **Code just written/modified** — Use **code-reviewer** agent to catch issues
3. **Architectural decision needed** — Use **architect** agent for design
4. **Build failure** — Use **build-fixer** agent for targeted fixes

## Parallel Task Execution

ALWAYS use parallel agent execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of data layer
3. Agent 3: Build verification across all targets

# BAD: Sequential when tasks are independent
First agent 1... wait... then agent 2... wait... then agent 3
```

## Multi-Perspective Analysis

For complex problems, use multiple review perspectives:
- **Factual reviewer**: Does the code do what it claims?
- **Senior engineer**: Is this the right approach architecturally?
- **Security expert**: Are there vulnerabilities or data leaks?
- **Performance analyst**: Are there bottlenecks or resource issues?

## Validation Approach

After implementation, validate through real system behavior:
1. Build the actual application
2. Run it in the real environment (dev server, simulator, container)
3. Exercise the feature through its actual interface
4. Capture evidence (screenshots, logs, API responses)
5. Verify behavior matches requirements
