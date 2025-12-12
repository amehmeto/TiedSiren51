# Foreground Service for Background App Detection

Date: 2025-12-11

## Status

Accepted

## Context

The `AccessibilityServiceSirenLookout` subscribes to native AccessibilityService events to detect app launches, but when the app is backgrounded or killed:

- The JS listener is destroyed while the native Android AccessibilityService continues running
- Events like "Detected app launch: {packageName}" never fire when app is in background
- Competitor apps show a persistent notification icon that keeps the app process alive

This is a fundamental limitation of React Native: JavaScript code cannot run when the app process is killed. The AccessibilityService runs at the OS level but needs a running JS runtime to communicate events to our app logic.

### Constraints

- Must work with Expo managed workflow
- Must follow existing hexagonal architecture patterns
- Battery efficiency is important - only run when block sessions exist
- Android requires foreground services to show a notification (API 26+)

## Decision

Integrate the `foreground-ss` Expo module to provide a persistent foreground service that keeps the app process alive when block sessions are active.

### Architecture

- **ForegroundService** is a separate port/adapter (not integrated into SirenLookout)
- **Coordinated by `onBlockSessionsChangedListener`** - same place that controls sirenLookout
- **Fire-and-forget async** - foreground service starts/stops asynchronously without blocking sirenLookout

### Implementation

**Port**: `/core/_ports_/foreground.service.ts`

```typescript
export interface ForegroundService {
  start(config?: Partial<ForegroundServiceConfig>): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean
}
```

**Real Adapter**: `/infra/foreground-service/expo.foreground.service.ts`
- Uses `foreground-ss` package
- Handles Android notification permissions (POST_NOTIFICATIONS)
- No-op on iOS/web

**Fake Adapter**: `/infra/foreground-service/in-memory.foreground.service.ts`
- For testing, tracks `startCallCount`, `stopCallCount`

**Config Plugin**: `/plugins/withForegroundService.js`
- Adds Android permissions: FOREGROUND_SERVICE, FOREGROUND_SERVICE_DATA_SYNC, POST_NOTIFICATIONS
- Registers ForegroundService in AndroidManifest.xml

### Lifecycle

When block sessions change:

1. **Sessions added**: Start foreground service (async) + start watching (sync)
2. **Sessions removed**: Stop watching (sync) + stop foreground service (async)

The sirenLookout operations remain synchronous to ensure immediate state updates in tests. The foreground service operations are fire-and-forget async since they don't need to block.

## Consequences

### Positive

- App stays alive in background when blocking is active
- AccessibilityService events are properly received
- Follows existing hexagonal architecture patterns
- Battery efficient - only runs when needed
- Users see clear "TiedSiren is protecting you" notification

### Negative

- Persistent notification visible when block sessions are active
- Additional dependency on `foreground-ss` package
- More complex listener coordination code

### Neutral

- Service type is `dataSync` which is appropriate for our use case
- Notification text is hardcoded but could be made configurable

## Alternatives Considered

### 1. WorkManager with periodic checks

- **Description**: Use Android WorkManager for periodic app detection
- **Rejected because**: Cannot provide real-time detection, only periodic polling
- **Trade-offs**: Less battery impact but much less effective

### 2. Integrate foreground service into SirenLookout

- **Description**: Have SirenLookout manage its own foreground service
- **Rejected because**: Violates single responsibility, makes testing harder
- **Trade-offs**: Simpler coordination but messier adapter code

### 3. Native module with integrated foreground service

- **Description**: Build custom native module combining AccessibilityService + ForegroundService
- **Rejected because**: Much more complex, harder to maintain with Expo
- **Trade-offs**: Could be more efficient but significant development cost

## Implementation Notes

### Key files affected

- `core/_ports_/foreground.service.ts` - Port interface
- `core/_redux_/dependencies.ts` - Added to Dependencies type
- `core/siren/listeners/on-block-sessions-changed.listener.ts` - Coordination logic
- `core/_redux_/registerListeners.ts` - Pass foregroundService to listener
- `infra/foreground-service/` - Real and fake adapters
- `plugins/withForegroundService.js` - Android manifest modifications
- `app.config.js` - Plugin registration
- `ui/dependencies.ts` - Production dependency injection
- `core/_tests_/createTestStore.ts` - Test dependency injection

### Required rebuild

After merging, rebuild the Android app:

```bash
npx expo prebuild --clean && npx expo run:android
```

## References

- [foreground-ss npm package](https://www.npmjs.com/package/foreground-ss)
- [Android Foreground Services documentation](https://developer.android.com/develop/background-work/services/foreground-services)
- [Hexagonal Architecture ADR](../hexagonal-architecture.md)
