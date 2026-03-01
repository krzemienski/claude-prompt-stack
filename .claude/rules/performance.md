# Performance Optimization

## Model Selection Strategy

When working with multi-model AI agent systems, route tasks to the appropriate model tier:

### Haiku / Small Models (fast, cost-effective)
Best for:
- Lightweight agents with frequent invocation
- Code search and file exploration
- Simple code generation and pair programming
- Worker agents in multi-agent systems

### Sonnet / Medium Models (balanced)
Best for:
- Main development work and implementation
- Orchestrating multi-agent workflows
- Standard debugging and code review
- Complex coding tasks

### Opus / Large Models (deepest reasoning)
Best for:
- Complex architectural decisions
- Deep analysis and research tasks
- Multi-file refactoring with many dependencies
- Security audits and vulnerability analysis

## Context Window Management

### High Context Sensitivity (avoid last 20% of context)
- Large-scale refactoring across many files
- Feature implementation spanning multiple modules
- Debugging complex interactions between systems

### Low Context Sensitivity (safe at any context level)
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple, isolated bug fixes

## Build Performance

### Incremental Builds
- Always use incremental builds during development
- Full clean builds only when debugging build issues
- Cache dependencies aggressively (node_modules, .build, target/)

### Build Troubleshooting
If build fails:
1. Use a **build-fixer** agent for targeted diagnosis
2. Analyze the full error output (not just the first error)
3. Fix incrementally — one error at a time
4. Verify after each fix before moving to the next

### Optimization Checklist
- [ ] Are we using incremental builds?
- [ ] Are dependencies cached between runs?
- [ ] Is the build command targeting only changed code?
- [ ] Are we avoiding unnecessary clean builds?
