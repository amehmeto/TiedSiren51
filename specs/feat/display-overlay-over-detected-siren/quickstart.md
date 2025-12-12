# Quickstart: Android Blocking Overlay Implementation

**Feature**: Android Implementation of Siren Blocking
**Date**: 2025-01-24
**For**: Developers working with TiedSiren51

## Overview

This guide shows how to use the Android-specific implementation of `SirenTier` to display fullscreen blocking overlays when users attempt to open blocked apps ("sirens").

**Key Concept**: `SirenTier` is a platform-agnostic port interface. This feature implements it for Android using a native overlay Activity. The same interface can be implemented differently on iOS (ScreenTime API) or Web (browser extension) in the future.

---

## Prerequisites

- Android physical device (API 26+)
- TiedSiren51 development environment set up
- Basic understanding of Redux Toolkit and hexagonal architecture

---

## Quick Start (5 minutes)

### 1. Use SirenTier in your Redux thunk

```typescript
// core/siren/usecases/blockDetectedSiren.ts
import { createAppAsyncThunk } from 'core/_redux_/create-app-thunk';

export const blockDetectedSiren = createAppAsyncThunk(
  'siren/blockDetected',
  async (packageName: string, { extra }) => {
    // Access SirenTier via dependency injection
    // On Android: launches fullscreen overlay Activity
    // On iOS/Web: different implementation (future)
    await extra.sirenTier.block(packageName);
  }
);
```

### 2. Dispatch the thunk when a blocked app is detected

```typescript
// core/siren/listeners/sirenDetectedListener.ts
import { startListening } from 'core/_redux_/listenerMiddleware';
import { sirenDetected } from 'core/siren/siren.slice';
import { blockDetectedSiren } from 'core/siren/usecases/blockDetectedSiren';

export const registerSirenDetectedListener = () => {
  startListening({
    actionCreator: sirenDetected,
    effect: async (action, listenerApi) => {
      const { packageName } = action.payload;
      const state = listenerApi.getState();

      // Check if app should be blocked
      const shouldBlock = selectShouldBlockApp(state, packageName);

      if (shouldBlock) {
        // Block via SirenTier (platform-specific implementation)
        await listenerApi.dispatch(blockDetectedSiren(packageName));
      }
    },
  });
};
```

### 3. Test it!

```bash
# Run the app on a physical Android device
npm run android

# Open a blocked app (e.g., Facebook, Instagram)
# The blocking overlay should appear within 200ms
# Click "Close" button to return to home screen
```

---

## Architecture

### Hexagonal Architecture Flow

```
User opens blocked app
         ↓
AccessibilityService detects app launch
         ↓
Redux Action: sirenDetected(packageName)
         ↓
Listener: Check if app should be blocked
         ↓
Thunk: blockDetectedSiren(packageName)
         ↓
Core → SirenTier port (dependency injection)
         ↓
Infra → AndroidSirenTier implements SirenTier
         ↓
Native → expo-blocking-overlay (Kotlin module)
         ↓
Android → BlockingOverlayActivity with "Close" button
         ↓
User clicks "Close" → Android home screen
```

### Platform-Specific Implementations

**Current**:
- Android: `AndroidSirenTier` → fullscreen overlay Activity with "Close" button

**Future**:
- iOS: `IOSSirenTier` → might use ScreenTime API or similar
- Web: `WebSirenTier` → might use browser extension or modal

All implement the same `SirenTier` interface, so core business logic doesn't change.

### Dependency Injection

The correct implementation is injected via the factory pattern:

**Production** (`/ui/dependencies.ts`):
```typescript
import { AndroidSirenTier } from 'infra/siren-tier/AndroidSirenTier';
import { InMemorySirenTier } from 'infra/siren-tier/in-memory.siren-tier';
import { Platform } from 'react-native';

export const createMobileDependencies = (): Dependencies => ({
  // ... other dependencies
  sirenTier: Platform.OS === 'android'
    ? new AndroidSirenTier()
    : new InMemorySirenTier(), // Fallback for iOS/Web until implemented
});
```

**Testing** (`/core/_tests_/createTestStore.ts`):
```typescript
import { InMemorySirenTier } from 'infra/siren-tier/in-memory.siren-tier';

export const createTestStore = (
  preloadedState?: RootState,
  dependencies?: Partial<Dependencies>
) => {
  const testDependencies: Dependencies = {
    // ... other dependencies
    sirenTier: new InMemorySirenTier(), // Use in-memory for all tests
    ...dependencies, // Allow overrides
  };

  return createStore(testDependencies, preloadedState);
};
```

---

## Testing

### Unit Tests (TypeScript)

```typescript
// core/siren/usecases/blockDetectedSiren.test.ts
import { createTestStore } from 'core/_tests_/createTestStore';
import { InMemorySirenTier } from 'infra/siren-tier/in-memory.siren-tier';
import { blockDetectedSiren } from './blockDetectedSiren';

describe('blockDetectedSiren', () => {
  it('calls SirenTier.block() with correct package name', async () => {
    const inMemorySirenTier = new InMemorySirenTier();
    const store = createTestStore({}, { sirenTier: inMemorySirenTier });

    await store.dispatch(blockDetectedSiren('com.facebook.katana'));

    expect(inMemorySirenTier.blockedApps).toContain('com.facebook.katana');
  });

  it('handles errors gracefully', async () => {
    const faultySirenTier = {
      target: jest.fn(),
      block: jest.fn().mockRejectedValue(new Error('Platform error')),
    };

    const store = createTestStore({}, { sirenTier: faultySirenTier });

    await expect(
      store.dispatch(blockDetectedSiren('com.facebook.katana'))
    ).rejects.toThrow('Platform error');
  });
});
```

### Integration Tests (Redux Listener)

```typescript
// core/siren/listeners/sirenDetectedListener.test.ts
describe('sirenDetectedListener', () => {
  it('blocks app when detected during active session', async () => {
    const inMemorySirenTier = new InMemorySirenTier();
    const store = createTestStore(
      {
        blockSession: {
          active: true,
          blockedApps: ['com.facebook.katana'],
          endTime: Date.now() + 3600000,
        },
      },
      { sirenTier: inMemorySirenTier }
    );

    // Simulate app detection
    store.dispatch(sirenDetected({ packageName: 'com.facebook.katana' }));

    // Wait for listener to process
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify app was blocked via SirenTier
    expect(inMemorySirenTier.blockedApps).toContain('com.facebook.katana');
  });

  it('does not block non-targeted apps', async () => {
    const inMemorySirenTier = new InMemorySirenTier();
    const store = createTestStore(
      {
        blockSession: {
          active: true,
          blockedApps: ['com.facebook.katana'],
          endTime: Date.now() + 3600000,
        },
      },
      { sirenTier: inMemorySirenTier }
    );

    // Simulate non-blocked app
    store.dispatch(sirenDetected({ packageName: 'com.spotify.music' }));

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify app was NOT blocked
    expect(inMemorySirenTier.blockedApps).not.toContain('com.spotify.music');
  });
});
```

### Manual Testing (Physical Device)

1. **Setup**: Install TiedSiren51 on Android physical device (API 26+)
2. **Create block session**: Add Instagram to blocklist, set 30-minute session
3. **Trigger blocking**: Open Instagram app
4. **Expected**: Fullscreen overlay appears within 200ms with:
   - Message: "This app is blocked."
   - "Close" button visible and tappable
5. **Test back button**: Press back button → overlay should NOT dismiss
6. **Test "Close" button**: Click "Close" → should launch Android home screen (NOT return to Instagram)
7. **Repeat**: Test with Facebook, TikTok, other blocked apps

---

## Understanding the Close Button

**Important**: The overlay has a "Close" button that launches the Android home screen, NOT dismissing the overlay and returning to the blocked app.

### User Flow

```
User opens Facebook (blocked)
         ↓
Overlay appears: "This app is blocked." + [Close]
         ↓
User clicks [Close]
         ↓
Android home screen launches
         ↓
User is away from Facebook ✓
```

### Why not just dismiss the overlay?

If the overlay just dismissed and returned to the blocked app, the user could immediately access the distracting content. Instead, clicking "Close" takes them to the home screen, fulfilling the blocking goal.

### Implementation

```kotlin
// android/.../BlockingOverlayActivity.kt (in expo-blocking-overlay repository)
findViewById<Button>(R.id.closeButton).setOnClickListener {
    val homeIntent = Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_HOME)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    startActivity(homeIntent)
    finish() // Close blocking Activity
}
```

---

## Error Handling

### Invalid Package Name

The native module validates input and rejects promises on error:

```typescript
// In your thunk or listener
try {
  await sirenTier.block(''); // Empty string
} catch (error) {
  // Error: ERR_INVALID_PACKAGE - Package name cannot be empty
  console.error(error.message);
}
```

### Overlay Launch Failure

```typescript
try {
  await sirenTier.block('com.facebook.katana');
} catch (error) {
  // Error: ERR_OVERLAY_LAUNCH - Failed to launch overlay: [native error]
  console.error(error.message);

  // Fallback: Show in-app notification
  notificationService.show('Unable to block app at this time');
}
```

### Platform Not Supported

If you try to use `AndroidSirenTier` on iOS or Web (shouldn't happen with proper DI):

```typescript
// Dependency injection should handle this, but for reference:
const sirenTier = Platform.OS === 'android'
  ? new AndroidSirenTier()
  : new InMemorySirenTier(); // Fallback (just logs, no blocking)
```

---

## Performance

### Expected Performance

- **Launch time**: <200ms from `block()` call to overlay appearance
- **Memory usage**: Minimal (single Activity, static layout)
- **Battery impact**: Negligible (no background processing)

### Profiling

Use Android Profiler to verify overlay launch performance:

```bash
# Launch app with profiler attached
npm run android

# Trigger overlay
# In Android Studio → Profiler → CPU → Record
# Open blocked app
# Stop recording

# Verify: block() → Activity.onCreate() < 200ms
```

---

## Troubleshooting

### Overlay doesn't appear

**Possible causes**:
1. Running on emulator instead of physical device
2. Accessibility permission not granted
3. App crash before overlay launch

**Solution**:
- Check Logcat for errors: `adb logcat | grep ExpoBlockingOverlay`
- Verify accessibility permission enabled
- Test on physical device (API 26+)

### Overlay is dismissible by back button

**Possible cause**: Intent flags not correctly applied

**Solution**:
- Verify `BlockingOverlayActivity.onBackPressed()` overridden
- Check Intent flags: `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK | FLAG_ACTIVITY_NO_HISTORY`

### Overlay launches slowly (>200ms)

**Possible causes**:
- Complex Activity layout
- Heavy initialization in `onCreate()`

**Solution**:
- Use simple layout with minimal views
- Avoid animations or complex styling
- Profile with Android Studio CPU Profiler

### "Close" button returns to blocked app instead of home screen

**Possible cause**: Wrong Intent used in click handler

**Solution**:
- Verify Intent uses `ACTION_MAIN` + `CATEGORY_HOME`
- Ensure `finish()` is called after launching home Intent

---

## Advanced Usage

### Custom Overlay Messages (Future Enhancement)

Currently, the overlay displays a static message. To customize in the future:

```kotlin
// android/.../BlockingOverlayActivity.kt (in expo-blocking-overlay repository)
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_blocking_overlay)

    val packageName = intent.getStringExtra("packageName")
    val blockUntil = intent.getLongExtra("blockUntil", 0)

    // Custom message based on blocked app
    val message = when (packageName) {
        "com.facebook.katana" -> "Facebook is blocked until ${formatTime(blockUntil)}"
        "com.instagram.android" -> "Instagram is blocked. Stay focused!"
        else -> "This app is blocked."
    }

    findViewById<TextView>(R.id.blockMessage).text = message
}
```

### Implementing for Other Platforms

To add iOS or Web support, implement `SirenTier` with platform-specific blocking:

```typescript
// infra/siren-tier/IOSSirenTier.ts (Future)
import { SirenTier } from '@core/_ports_/siren.tier';
import { Sirens } from '@core/siren/sirens';

export class IOSSirenTier implements SirenTier {
  async target(sirens: Sirens): Promise<void> {
    // Setup iOS ScreenTime API monitoring
  }

  async block(packageName: string): Promise<void> {
    // Use ScreenTime API to block app
  }
}
```

Then update dependency injection:

```typescript
// ui/dependencies.ts
export const createMobileDependencies = (): Dependencies => ({
  sirenTier: Platform.select({
    android: new AndroidSirenTier(),
    ios: new IOSSirenTier(), // When implemented
    default: new InMemorySirenTier(),
  }),
});
```

---

## Next Steps

1. **Implement module**: Follow `/specs/feat/display-overlay-over-detected-siren/plan.md`
2. **Create AndroidSirenTier**: Implement `SirenTier` interface in `/infra/siren-tier/`
3. **Build native module**: Create `expo-blocking-overlay` Kotlin module
4. **Test on devices**: Samsung, Pixel, OnePlus, Xiaomi (API 26, 29, 31, 33, 34)
5. **Wire up DI**: Update `/ui/dependencies.ts` to use `AndroidSirenTier` on Android
6. **Performance testing**: Verify <200ms launch time with Android Profiler

---

## References

- **Feature Spec**: `/specs/feat/display-overlay-over-detected-siren/spec.md`
- **Implementation Plan**: `/specs/feat/display-overlay-over-detected-siren/plan.md`
- **Data Model**: `/specs/feat/display-overlay-over-detected-siren/data-model.md`
- **Functional Overview**: `/specs/feat/display-overlay-over-detected-siren/functional-overview.md`
- **Native API**: `/specs/feat/display-overlay-over-detected-siren/native-api/expo-blocking-overlay.md`
- **Research**: `/specs/feat/display-overlay-over-detected-siren/research.md`
- **Port Naming Convention ADR**: `/docs/adr/core/port-naming-convention.md`
- **GitHub Issue**: https://github.com/amehmeto/TiedSiren51/issues/102
- **Expo Modules API**: https://docs.expo.dev/modules/overview/
