# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body explaining why, not what>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation only |
| `chore` | Build, config, tooling changes |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `style` | Formatting, whitespace (no logic change) |

### Examples

```
feat: add user authentication with JWT tokens

fix: prevent race condition in session cleanup

refactor: extract API client into standalone service

docs: add deployment guide for production setup
```

## Pull Request Workflow

When creating PRs:

1. **Analyze full commit history** — not just the latest commit
2. **Use `git diff [base-branch]...HEAD`** to see all changes since branch divergence
3. **Draft comprehensive PR summary** including:
   - What changed and why
   - How it was tested/validated
   - Any breaking changes or migration steps
4. **Include validation evidence** (screenshots, build output, test logs)
5. **Push with `-u` flag** if the branch is new

### PR Description Template

```markdown
## Summary
- [1-3 bullet points describing the change]

## Validation
- [ ] Build passes locally
- [ ] Feature verified through real UI/API
- [ ] No regressions in existing functionality
- [ ] Evidence captured: [link or description]

## Breaking Changes
- None / [describe breaking changes]
```

## Branch Naming

```
feat/short-description
fix/issue-number-description
refactor/area-description
```
