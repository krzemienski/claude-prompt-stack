# iOS Validation Runner Skill

## Purpose

Validates iOS/macOS features by building, installing, and running the real application on a simulator. Captures screenshots as evidence of working functionality.

## Prerequisites

- Xcode installed with command-line tools
- Dedicated simulator configured (see project.md for UDID)
- `xcrun simctl` available in PATH

## When to Invoke

- After implementing any iOS/macOS UI change
- After modifying view models or data flow
- Before claiming a mobile feature is complete
- When validating deep links or navigation

## Workflow

### Step 1: Boot the Simulator

```bash
# Boot the dedicated simulator (use YOUR project's UDID)
xcrun simctl boot [SIMULATOR_UDID] 2>/dev/null || true

# Verify it's booted
xcrun simctl list devices | grep Booted
```

### Step 2: Build and Install

```bash
# Build for the simulator
xcodebuild -project [PROJECT].xcodeproj \
  -scheme [SCHEME] \
  -destination 'id=[SIMULATOR_UDID]' \
  -quiet

# Find the built app
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/[PROJECT]-*/Build/Products/Debug-iphonesimulator -name "*.app" -maxdepth 1 | head -1)

# Install on simulator
xcrun simctl install [SIMULATOR_UDID] "$APP_PATH"
```

### Step 3: Launch the App

```bash
# Launch the app
xcrun simctl launch [SIMULATOR_UDID] [BUNDLE_ID]

# Wait for app to fully load
sleep 3
```

### Step 4: Navigate to Feature

Use one of these approaches (in order of reliability):

1. **Deep links** (if supported):
   ```bash
   xcrun simctl openurl [SIMULATOR_UDID] "[URL_SCHEME]://[ROUTE]"
   ```

2. **Accessibility tree** (most reliable for taps):
   ```bash
   # Get accessibility tree with exact coordinates
   idb_describe operation:all
   # Then tap using coordinates from the tree
   idb_tap [x] [y]
   ```

3. **Direct state modification** (for screenshots only):
   Temporarily modify `@State` defaults to auto-present the target view.

### Step 5: Capture Evidence

```bash
# Screenshot the simulator
xcrun simctl io [SIMULATOR_UDID] screenshot /tmp/evidence/feature-name.png
```

### Step 6: Verify

- Open the screenshot and verify the feature renders correctly
- Check for layout issues, missing data, or visual regressions
- Compare against design specs or requirements

## Tips

- **DerivedData path**: Always use `~/Library/Developer/Xcode/DerivedData/`, NOT a local `build/` directory
- **Deep link UUIDs**: Must be LOWERCASE — uppercase causes failures
- **Simulator gestures**: Use `idb_describe` for accessibility coordinates, never guess pixels
- **Fresh install**: `xcrun simctl uninstall + install` resets UserDefaults state
- **Multiple simulators**: ONLY use the dedicated simulator UDID from project.md

## Evidence Naming Convention

```
/tmp/evidence/
├── feature-name-01-initial.png
├── feature-name-02-interaction.png
├── feature-name-03-result.png
└── feature-name-validation.log
```
