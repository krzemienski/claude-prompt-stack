# Feature Gating

Feature gates control access to premium or experimental features. **NEVER bypass or duplicate feature gates.**

## The System

| Component | Purpose |
|-----------|---------|
| `FeatureGate` | Central service that checks feature availability |
| `FeatureGateView` / `FeatureGateComponent` | UI wrapper that conditionally renders content |
| `SubscriptionManager` / `BillingService` | Source of truth for user entitlements |
| `PremiumView` / `PaywallComponent` | Upgrade prompt shown to free-tier users |

## Gated Features

| Feature | Free Tier | Premium |
|---------|-----------|---------|
| `[FEATURE_1]` | Limited (e.g., 5 items) | Unlimited |
| `[FEATURE_2]` | Not available | Full access |
| `[FEATURE_3]` | Basic version | Advanced version |
| `[FEATURE_4]` | Not available | Full access |

## Usage Patterns

**Imperative check (in services/business logic):**
```
if featureGate.isAvailable(.featureName) {
    // allow the action
} else {
    // show upgrade prompt or degrade gracefully
}
```

**Declarative gate (in UI components):**
```
FeatureGateView(feature: .featureName) {
    PremiumContent()  // Only rendered for entitled users
}
// Free users see "Premium Required" overlay with upgrade button
```

## Rules

- **NEVER** add inline `if isPremium` checks scattered through the codebase — use the gate system
- **NEVER** create new feature types without adding to the `Feature` enum/constant
- **NEVER** hardcode premium status as `true` even in development — test both states
- **NEVER** duplicate gate logic — there should be one source of truth for entitlements
- The `SubscriptionManager` / `BillingService` owns the source of truth for premium status
