# Native-Level Siren Filtering Optimization

> Created: December 11, 2025
> Updated: January 2026
> Status: **IMPLEMENTED** (via native blocking)
> Priority: N/A - Superseded by native architecture

## Historical Context

This document originally proposed optimizing the JS-side app detection path. That path was never implemented because we moved directly to native blocking.

### Original JS Path (Never Implemented)

```
AccessibilityService → JS subscription → selectTargetedApps → blockLaunchedApp → showOverlay
```

This approach would have required:

1. Every app launch triggering a JS bridge call
2. A `blockLaunchedApp` usecase to query Redux state
3. JS deciding whether to block and calling `sirenTier.block()`

### Current Native Path (Implemented)

```
AccessibilityService → BlockingCallback → SharedPreferences → showOverlay
```

The native path is:

- **Faster**: No JS bridge crossing for blocking decisions
- **Reliable**: Works even when JS runtime is killed
- **Simpler**: All blocking logic in Kotlin native module

## Implementation Details

The current architecture:

1. **`onBlockingScheduleChangedListener`** syncs schedules to native via `SirenTier.updateBlockingSchedule()`
2. **`AndroidSirenTier`** calls native module methods:
   - `setBlockingSchedule()` - passes time windows to native
   - `setBlockedApps()` - passes package names to SharedPreferences
3. **Native `BlockingCallback`** (in `tied-siren-blocking-overlay`) checks SharedPreferences directly

## Removed Artifacts

The following were designed for the JS path and have been removed:

- **`selectTargetedApps`** - Selector for getting blocked apps from Redux state (deleted)
- **`blockLaunchedApp` usecase** - Was planned but never created

## Related Files

- `core/_ports_/siren.tier.ts` - Port interface for blocking
- `infra/siren-tier/android.siren-tier.ts` - Native module wrapper
- `core/siren/listeners/on-blocking-schedule-changed.listener.ts` - Syncs schedule to native

## See Also

- Issue #182: Update AndroidSirenTier to call setBlockingSchedule
- Issue #184: Deprecate JS detection path (this update)
