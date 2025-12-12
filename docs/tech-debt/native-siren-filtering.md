# Native-Level Siren Filtering Optimization

> Created: December 11, 2025
> Status: Proposed
> Priority: 📋 **LOW** - Optimization for high-volume scenarios
> Effort: Medium

## Context

The current siren detection flow:

1. **AccessibilityService** detects ANY app launch
2. **JS Bridge** receives the package name via event listener
3. **blockLaunchedApp usecase** queries Redux state via `selectTargetedApps`
4. **If targeted**, calls `sirenTier.block(packageName)`

This means every app launch triggers a JS bridge call, even for non-blocked apps.

## Current Design (Intentional)

The `SirenLookout` interface was simplified to:

```typescript
interface SirenLookout {
  startWatching(): void
  stopWatching(): void
  onSirenDetected(listener: (packageName: string) => void): void
}
```

The lookout doesn't know which apps to block - it just detects app launches. Filtering happens in the business logic layer (`selectTargetedApps`), which is cleaner from a hexagonal architecture perspective:

- **Separation of concerns**: Detection vs. decision-making
- **Single source of truth**: Block lists live in Redux/Prisma, not duplicated in native
- **Testability**: Business logic is easily unit-tested without native mocking

## Proposed Optimization

For performance-critical scenarios (many block sessions, frequent app switching), we could:

1. **Pass target package names to native layer**:
   ```typescript
   interface OptimizedSirenLookout extends SirenLookout {
     updateTargets(packageNames: string[]): void
   }
   ```

2. **Filter at native level** before crossing JS bridge:
   - Only emit events for apps in the target list
   - Reduces JS bridge calls significantly

3. **Sync targets on session changes**:
   - Listener calls `updateTargets()` when block sessions change
   - Native layer maintains a Set of target package names

## Trade-offs

### Pros
- Fewer JS bridge crossings
- Lower latency for non-blocked apps
- Better battery efficiency in high-use scenarios

### Cons
- Duplicated state (targets in both Redux and native)
- Sync complexity (must keep native list updated)
- More complex native module code
- Potential for inconsistency if sync fails

## Trigger Points

Consider implementing when:
- Users report lag when switching apps
- Profiling shows JS bridge as bottleneck
- Block lists grow large (50+ apps)
- Battery usage becomes a concern

## Implementation Notes

If implementing:
1. Add `updateTargets(packageNames: string[])` to `AndroidSirenLookout`
2. Modify `onBlockSessionsChangedListener` to extract and pass package names
3. Update Kotlin native module to filter events
4. Add fallback: if native filtering fails, fall back to current JS filtering

## Related Files

- `core/_ports_/siren.lookout.ts`
- `infra/siren-tier/real.android-siren-lookout.ts`
- `core/siren/listeners/on-block-sessions-changed.listener.ts`
- `core/siren/usecases/block-launched-app.usecase.ts`
