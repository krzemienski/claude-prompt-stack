# Security Rules

## Pre-Commit Security Scanning

The pre-commit hook (`pre-commit-check.sh`) automatically scans staged files before every commit.

### Blocked Patterns (commit will be rejected)

| Pattern | Risk | Example |
|---------|------|---------|
| `sk-[a-zA-Z0-9]` | API keys (OpenAI, Anthropic) | `sk-proj-abc123...` |
| `AKIA[A-Z0-9]` | AWS access keys | `AKIAIOSFODNN7EXAMPLE` |
| `ghp_[a-zA-Z0-9]` | GitHub personal access tokens | `ghp_xxxxxxxxxxxx` |
| `ghu_[a-zA-Z0-9]` | GitHub user tokens | `ghu_xxxxxxxxxxxx` |
| `glpat-[a-zA-Z0-9]` | GitLab personal access tokens | `glpat-xxxxxxxxx` |
| `.sqlite` / `.db` files | Database files with user data | `app.sqlite` |
| `.env` files | Environment config with secrets | `.env.local` |
| `Bearer [a-zA-Z0-9]` | Hardcoded auth tokens | `Bearer eyJhbGci...` |

### Warning Patterns (commit proceeds with warning)

| Pattern | Risk | Recommendation |
|---------|------|----------------|
| `/Users/` or `/home/` | Hardcoded absolute paths | Use relative paths or env vars |
| `password = "` | Hardcoded passwords | Use environment variables |
| `127.0.0.1` or `localhost` | Hardcoded host | Use configuration |

## Code-Level Security Rules

### Authentication & Authorization
- Never store tokens in plain text or local storage
- Use secure token storage (Keychain, encrypted storage)
- Validate all authentication tokens server-side
- Implement token refresh mechanisms

### Input Validation
- Validate all user input before processing
- Sanitize data before database queries (use parameterized queries)
- Validate file uploads (type, size, content)
- Escape output to prevent XSS

### Data Protection
- Use HTTPS for all network communication
- Encrypt sensitive data at rest
- Minimize data collection (collect only what's needed)
- Implement proper data retention policies

### Dependency Security
- Audit dependencies regularly (`npm audit`, `cargo audit`, etc.)
- Pin dependency versions in production
- Review new dependencies before adding them
- Remove unused dependencies

## Security Review Triggers

Invoke the **security-reviewer** agent when:
- Adding or modifying authentication/authorization logic
- Creating new API endpoints
- Handling user-uploaded files
- Modifying database queries
- Adding new dependencies
- Changing encryption or hashing implementations
