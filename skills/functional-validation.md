# Functional Validation Skill

## Purpose

Validates features by building and running the **real system** — never mocks, stubs, or test doubles. This skill enforces evidence-based completion claims through actual UI/API interaction.

## When to Invoke

- After implementing a new feature
- After fixing a bug
- Before claiming any task is complete
- When the user asks "does it work?"

## Workflow

### Step 1: Build the Real Application

```bash
# Build the project using the project's actual build command
[BUILD_COMMAND]
```

Verify the build succeeds with zero errors. If it fails, fix the build first.

### Step 2: Start the Application

```bash
# Run the application in its real environment
[RUN_COMMAND]
```

Wait for the application to be fully ready (health check, UI loaded, etc.).

### Step 3: Exercise the Feature

Interact with the feature through its **actual interface**:
- For web apps: Navigate to the page, click buttons, fill forms
- For APIs: Send real HTTP requests with `curl` or similar
- For CLI tools: Run the actual commands with real arguments
- For mobile apps: Navigate the real UI in the simulator/emulator

### Step 4: Capture Evidence

Collect at least one form of evidence:
- **Screenshots**: Capture the UI showing the feature working
- **API responses**: Save curl output showing correct data
- **Log output**: Capture relevant log lines showing correct behavior
- **Terminal output**: Save command output showing expected results

### Step 5: Verify Against Requirements

Compare the captured evidence against the original requirements:
- Does the feature do what was asked?
- Are edge cases handled?
- Is the user experience correct?
- Are there any regressions in existing functionality?

## Evidence Standards

| Claim | Minimum Evidence |
|-------|-----------------|
| "Feature works" | Screenshot or API response showing it working |
| "Bug is fixed" | Before/after evidence showing the fix |
| "No regressions" | Key existing features still function |
| "Performance improved" | Measurable metrics (timing, memory, etc.) |

## Anti-Patterns

- **NEVER** claim "it should work" without evidence
- **NEVER** create mock objects to simulate behavior
- **NEVER** write unit tests as a substitute for functional validation
- **NEVER** skip the build step
- **NEVER** assume the feature works based on reading the code alone
