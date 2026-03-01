# CI/CD Configuration

## Build Pipelines

| Pipeline | Command | What It Does |
|----------|---------|--------------|
| `build` | `[BUILD_COMMAND]` | Debug/development build |
| `test` | `[TEST_COMMAND]` | Run test suite |
| `lint` | `[LINT_COMMAND]` | Code style and static analysis |
| `deploy:staging` | `[STAGING_DEPLOY]` | Deploy to staging environment |
| `deploy:production` | `[PROD_DEPLOY]` | Deploy to production |

## When to Use CI vs Local Commands

| Task | Use |
|------|-----|
| Quick build check during dev | Local build command (faster feedback) |
| Pre-merge validation | CI pipeline (full test suite) |
| Staging deployment | CI pipeline (automated) |
| Production deployment | CI pipeline (with approval gate) |

## Pipeline Configuration

### Build Stage
```yaml
# Example: GitHub Actions
build:
  runs-on: [RUNNER]
  steps:
    - uses: actions/checkout@v4
    - name: Install dependencies
      run: [INSTALL_COMMAND]
    - name: Build
      run: [BUILD_COMMAND]
    - name: Lint
      run: [LINT_COMMAND]
```

### Deploy Stage
```yaml
deploy:
  needs: build
  runs-on: [RUNNER]
  environment: [staging|production]
  steps:
    - name: Deploy
      run: [DEPLOY_COMMAND]
```

## Environment Configuration

| Environment | Branch | Auto-Deploy | Approval Required |
|------------|--------|-------------|-------------------|
| Development | `dev` | Yes | No |
| Staging | `main` | Yes | No |
| Production | `main` (tag) | No | Yes |

## Secrets Management

- Store secrets in CI/CD provider's secret storage (GitHub Secrets, etc.)
- **NEVER** commit secrets to the repository
- Use environment-specific secret scoping
- Rotate secrets on a regular schedule
- The pre-commit hook will block API keys from being committed
