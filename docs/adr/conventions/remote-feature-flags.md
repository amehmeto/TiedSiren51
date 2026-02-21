# Remote Feature Flags via Firebase Remote Config

Date: 2026-02-21

## Status

Accepted (supersedes [Static Feature Flags](static-feature-flags.md))

## Context

Feature flags were previously hardcoded in `feature-flags.ts` as compile-time boolean constants ([Static Feature Flags](static-feature-flags.md)). Toggling a flag required a code change, PR, and app update. Migrating to Firebase Remote Config enables toggling flags from the Firebase console without redeploying.

## Decision

**Use Firebase Remote Config behind a port, with flag values stored in Redux.**

### Convention 1: File Location

Flag defaults remain at the **project root** in `feature-flags.ts`. This file exports:

- `FeatureFlagKey` enum for flag keys
- `FeatureFlagValues` type (`Record<FeatureFlagKey, boolean>`)
- `DEFAULT_FEATURE_FLAGS` constant for local fallback values

### Convention 2: Hexagonal Architecture

A `FeatureFlagProvider` port in `core/_ports_/` abstracts the remote config service:

```typescript
export interface FeatureFlagProvider {
  fetchAndActivate(): Promise<void>
  getBoolean(key: FeatureFlagKey): boolean
}
```

Adapters:

- **Production**: `FirebaseFeatureFlagProvider` in `infra/feature-flag-provider/`
- **Testing**: `InMemoryFeatureFlagProvider` in `infra/feature-flag-provider/`

### Convention 3: Redux State

Feature flag values are stored in a `featureFlag` Redux slice. The `loadFeatureFlags` thunk fetches remote config and stores the result. If the fetch fails, the slice retains `DEFAULT_FEATURE_FLAGS`.

### Convention 4: Reading Flags in Components

Use the `selectFeatureFlags` Redux selector with destructuring. An ESLint rule (`require-feature-flag-destructuring`) enforces this pattern.

**Direct destructuring** — when you only need individual flags:

```typescript
const { APPLE_SIGN_IN: isAppleSignIn } = useSelector(selectFeatureFlags)
{isAppleSignIn && <AppleSignInButton />}
```

**Two-binding pattern** — when you also need the whole object (e.g. for schemas):

```typescript
const featureFlags = useSelector(selectFeatureFlags)
const { WEBSITE_BLOCKING: isWebsiteBlocking } = featureFlags
blocklistFormSchema(featureFlags).parse(data)
```

**Whole-object pattern** — when you only pass flags to a schema without using individual flags:

```typescript
const featureFlags = useSelector(selectFeatureFlags)
const validateForm = validateBlockSessionForm(featureFlags)
```

### Convention 5: Reading Flags in Schemas

Schemas that depend on flags accept a `FeatureFlagValues` parameter:

```typescript
export const blocklistFormSchema = (flags: FeatureFlagValues) => {
  return z.object({ ... })
}
```

### Convention 6: Initialization

Feature flags are fetched during app initialization in `useAppInitialization`, before loading user data.

### Convention 7: Testing

Use `InMemoryFeatureFlagProvider` with `setFlag()` to toggle flags per test:

```typescript
const featureFlagProvider = new InMemoryFeatureFlagProvider()
featureFlagProvider.setFlag(FeatureFlagKey.WEBSITE_BLOCKING, true)
const store = createTestStore({ featureFlagProvider })
```

For schema tests, pass flag values directly to the schema factory:

```typescript
const flags = { ...DEFAULT_FEATURE_FLAGS, WEBSITE_BLOCKING: true }
fixture = blocklistFormFixture(flags)
```

## Consequences

### Positive

- **No redeployment** required to toggle flags
- **Gradual rollout** possible via Firebase Remote Config percentage targeting
- **Hexagonal architecture** respected via port/adapter pattern
- **Testable** with `InMemoryFeatureFlagProvider`
- **Fallback safety** via `DEFAULT_FEATURE_FLAGS` when fetch fails

### Negative

- **Network dependency** for fresh values (mitigated by caching and defaults)
- **Async resolution** requires flags to load during app init
- **More complexity** than static booleans

## Alternatives Considered

### Keep Static Feature Flags

Rejected: Does not support runtime toggling. See [Static Feature Flags](static-feature-flags.md) for original rationale.

## Implementation Notes

### Key Files

| File | Purpose |
|------|---------|
| `feature-flags.ts` | Enum, types, and default values |
| `core/_ports_/feature-flag.provider.ts` | Port interface |
| `core/feature-flag/feature-flag.slice.ts` | Redux slice |
| `core/feature-flag/usecases/load-feature-flags.usecase.ts` | Fetch thunk |
| `core/feature-flag/selectors/selectFeatureFlags.ts` | Selector |
| `infra/feature-flag-provider/firebase.feature-flag.provider.ts` | Firebase adapter |
| `infra/feature-flag-provider/in-memory.feature-flag.provider.ts` | Test adapter |

### Adding a New Feature Flag

1. Add a new key to the `FeatureFlagKey` enum in `feature-flags.ts`
2. Add the key with its default value to `DEFAULT_FEATURE_FLAGS`
3. Add the key read in `loadFeatureFlags` thunk
4. Create the flag in the Firebase Remote Config console
5. Use `selectFeatureFlags` in components or pass flags to schemas

## References

- [PR #366](https://github.com/amehmeto/TiedSiren51/pull/366) - Implementation
- [Firebase Remote Config docs](https://firebase.google.com/docs/remote-config)
- [Static Feature Flags ADR](static-feature-flags.md) - Superseded
