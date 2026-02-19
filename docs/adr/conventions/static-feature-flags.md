# Static Feature Flags

Date: 2026-02-19

## Status

Accepted

## Context

Before submitting to the Google Play Store, unfinished UI features (website blocking, keyword blocking) needed to be hidden without deleting the underlying code. The goals were:

- Hide incomplete features from end users
- Keep existing code intact for future enablement
- Make it trivial to re-enable features once ready
- Avoid introducing runtime complexity or external dependencies

Feature flags are a cross-cutting concern that spans all layers (UI, Core, Infrastructure), so they don't belong to any single architectural layer.

## Decision

**Use a static feature flag module at the project root** (`feature-flags.ts`) with compile-time boolean constants.

### Convention 1: File Location

Feature flags live at the **project root**, not inside `core/`, `ui/`, or `infra/`. They are a cross-cutting concern imported via the `@/feature-flags` alias.

```
feature-flags.ts          # Project root — cross-cutting
├── core/                 # Can import feature flags
├── ui/                   # Can import feature flags
└── infra/                # Can import feature flags
```

### Convention 2: Enum Keys with Record Typing

Use an enum for flag keys and `Record<EnumKey, boolean>` for the flags object. This avoids `as const` literal types that trigger `@typescript-eslint/no-unnecessary-condition` when conditionals check a `false` literal.

```typescript
enum FeatureFlagKey {
  WEBSITE_BLOCKING = 'WEBSITE_BLOCKING',
  KEYWORD_BLOCKING = 'KEYWORD_BLOCKING',
}

export const FeatureFlags: Record<FeatureFlagKey, boolean> = {
  [FeatureFlagKey.WEBSITE_BLOCKING]: false,
  [FeatureFlagKey.KEYWORD_BLOCKING]: false,
}
```

### Convention 3: Conditional Rendering in UI

Use spread-based conditional arrays to include/exclude routes, tabs, or list items:

```typescript
const routes = [
  { key: 'apps', title: 'Apps' },
  ...(FeatureFlags.WEBSITE_BLOCKING
    ? [{ key: 'websites', title: 'Websites' }]
    : []),
]
```

### Convention 4: Conditional Validation in Schemas

Validation schemas respect feature flags to avoid requiring input for hidden features:

```typescript
const hasSelectedWebsites =
  FeatureFlags.WEBSITE_BLOCKING && (websites?.length ?? 0) > 0
```

### Convention 5: Testing with vi.mock

Mock the feature flags module and mutate the exported object to toggle flags per test suite:

```typescript
vi.mock('@/feature-flags', () => ({
  FeatureFlags: {
    WEBSITE_BLOCKING: false,
    KEYWORD_BLOCKING: false,
  },
}))

// In a describe block that needs flags enabled:
beforeEach(() => {
  FeatureFlags.WEBSITE_BLOCKING = true
})
```

## Consequences

### Positive

- **Zero runtime overhead** — flags are static booleans resolved at import time
- **Simple to toggle** — flip `false` to `true` in one file to enable a feature
- **No code deletion** — hidden features remain intact and testable
- **Layer-agnostic** — any layer can import without violating hexagonal architecture
- **Testable** — `vi.mock` with mutation allows testing both flag states

### Negative

- **Requires redeployment** — changing a flag means a new build (no runtime toggling)
- **No gradual rollout** — all-or-nothing per build (no A/B testing or percentage rollout)
- **Manual cleanup** — once a feature is permanently enabled, flag checks become dead code that should be removed

### Neutral

- **Static analysis** — tree-shaking may optimize away dead branches for disabled flags, but this is not guaranteed

## Alternatives Considered

### 1. Runtime Feature Flags (Remote Config)

Services like Firebase Remote Config or LaunchDarkly for runtime flag toggling.

Rejected: Premature for current needs. Adds external dependency, network calls, and loading states. Can be adopted later if A/B testing or gradual rollout is needed.

### 2. Feature Flags in Core Constants

Placing flags in `core/__constants__/feature-flags.ts`.

Rejected: Feature flags are a cross-cutting concern, not core business logic. Placing them in `core/` would incorrectly scope them to one layer.

### 3. Environment Variables

Using `process.env.FEATURE_WEBSITE_BLOCKING` or Expo's `Constants.expoConfig.extra`.

Rejected: More complex build configuration, harder to type-check, and unnecessary when flags don't need per-environment variation yet.

## Implementation Notes

### Affected Files

| File | How Flags Are Used |
|------|--------------------|
| `feature-flags.ts` | Flag definitions |
| `ui/screens/Blocklists/BlocklistForm.tsx` | Conditional tab routes |
| `ui/screens/Blocklists/ChooseBlockTabBar.tsx` | Derives visible tabs from routes |
| `ui/screens/Blocklists/schemas/blocklist-form.schema.ts` | Conditional validation rules |
| `ui/screens/Blocklists/schemas/blocklist-form.schema.test.ts` | Tests both flag states |

### Adding a New Feature Flag

1. Add a new key to the `FeatureFlagKey` enum in `feature-flags.ts`
2. Add the key with its default value (`false`) to the `FeatureFlags` object
3. Import `FeatureFlags` where needed and use conditionals
4. Add tests for both flag states

## References

- [PR #344](https://github.com/amehmeto/TiedSiren51/pull/344) — Initial implementation
- [Martin Fowler on Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
