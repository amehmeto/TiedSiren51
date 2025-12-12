# Data Model: Android Blocking Overlay Implementation

**Feature**: Android Implementation of Siren Blocking
**Date**: 2025-01-24

## Overview

This feature implements **Android-specific blocking** for the existing `SirenTier` port interface. The overlay Activity is an implementation detail - not a separate port.

**Key Insight**: `SirenTier` is platform-agnostic. HOW we block differs by platform:
- Android: Fullscreen overlay Activity
- iOS: Future - might use ScreenTime API or similar
- Web: Future - might use browser extension or modal

No new ports are created. No database entities are needed. This is a pure infrastructure adapter.

---

## Existing Port Interface

### SirenTier

**Purpose**: Platform-agnostic interface for detecting and blocking distracting apps ("sirens")

**Location**: `/core/_ports_/siren.tier.ts`

**Interface**:
```typescript
export interface SirenTier {
  /**
   * Set which apps (sirens) to monitor and potentially block
   * @param sirens - Collection of apps to watch across platforms
   */
  target(sirens: Sirens): Promise<void>

  /**
   * Block access to a specific app
   * @param packageName - Platform-specific app identifier
   *   - Android: package name (e.g., "com.facebook.katana")
   *   - iOS: bundle ID (e.g., "com.facebook.Facebook")
   */
  block(packageName: string): Promise<void>
}
```

**Existing Implementations**:
- `InMemorySirenTier` (testing): Just logs and tracks blocked apps
- `AndroidSirenTier` (what we're building): Uses native overlay Activity

---

## New Implementation: AndroidSirenTier

**Purpose**: Android-specific implementation of SirenTier using fullscreen overlay

**Location**: `/infra/siren-tier/AndroidSirenTier.ts`

**Implementation Strategy**:
```typescript
import { SirenTier } from '@core/_ports_/siren.tier';
import { Sirens } from '@core/siren/sirens';
import ExpoBlockingOverlay from 'expo-blocking-overlay';

export class AndroidSirenTier implements SirenTier {
  private targetedSirens: Sirens | undefined;

  async target(sirens: Sirens): Promise<void> {
    // Store which apps to monitor
    this.targetedSirens = sirens;

    // Could start AccessibilityService monitoring here
    // (or this might be handled elsewhere)
  }

  async block(packageName: string): Promise<void> {
    // Launch native overlay Activity
    // The Activity has a "Close" button that launches home screen
    // blockUntil can be retrieved from Redux state if needed
    await ExpoBlockingOverlay.showOverlay(
      packageName,
      Date.now() + (30 * 60 * 1000) // Example: 30 min from now
    );
  }
}
```

**Key Points**:
- Implements existing `SirenTier` interface
- Uses `expo-blocking-overlay` native module internally
- No changes to `SirenTier` interface required
- Fully compatible with existing core business logic

---

## Native Module: expo-blocking-overlay

**Purpose**: Standalone Expo module that launches Android blocking Activity

**Repository**: `github.com/amehmeto/expo-blocking-overlay` (separate repository)

**API**:
```typescript
interface ExpoBlockingOverlay {
  /**
   * Launches fullscreen blocking Activity
   * @param packageName - Android package name being blocked
   * @param blockUntil - Unix timestamp when block expires (for display only)
   */
  showOverlay(packageName: string, blockUntil: number): Promise<void>;
}
```

**Implementation**: Kotlin module using Expo Modules API

**What it does**:
1. Validates packageName (not null/empty)
2. Creates Intent with flags: NEW_TASK | CLEAR_TASK | NO_HISTORY
3. Launches BlockingOverlayActivity
4. Resolves promise when Activity starts
5. Logs errors and rejects promise on failure

---

## Native Activity: BlockingOverlayActivity

**Purpose**: Fullscreen Android Activity that blocks app access

**Location**: `android/.../BlockingOverlayActivity.kt` (in module repository)

**UI Elements**:
- **Text**: "This app is blocked"
- **Button**: "Close" (launches home screen)

**Behavior**:
- `onCreate()`: Display UI, read Intent extras
- `onBackPressed()`: Override to no-op (prevent back dismissal)
- `closeButton.onClick()`: Launch home screen Intent

**Implementation Pattern**:
```kotlin
class BlockingOverlayActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_blocking_overlay)

        val packageName = intent.getStringExtra("packageName")
        val blockUntil = intent.getLongExtra("blockUntil", 0)

        // Display message
        findViewById<TextView>(R.id.blockMessage).text =
            "This app is blocked."

        // Close button launches home screen
        findViewById<Button>(R.id.closeButton).setOnClickListener {
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(homeIntent)
            finish() // Close blocking Activity
        }
    }

    override fun onBackPressed() {
        // Do nothing - prevent back button dismissal
    }
}
```

**Key Features**:
- Non-dismissible via back button
- "Close" launches home (doesn't return to blocked app)
- Simple, fast UI (<200ms launch time)

---

## Integration with Existing Code

### Dependency Injection

**Production** (`/ui/dependencies.ts`):
```typescript
import { AndroidSirenTier } from 'infra/siren-tier/AndroidSirenTier';
import { InMemorySirenTier } from 'infra/siren-tier/in-memory.siren-tier';

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

### Usage in Core Logic

**Example**: Block siren when detected
```typescript
// core/siren/usecases/blockDetectedSiren.ts
import { createAppAsyncThunk } from 'core/_redux_/create-app-thunk';

export const blockDetectedSiren = createAppAsyncThunk(
  'siren/blockDetected',
  async (packageName: string, { extra }) => {
    // Access SirenTier via dependency injection
    await extra.sirenTier.block(packageName);
  }
);
```

**Example**: Listener that triggers blocking
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

      // Check if we should block this app
      const shouldBlock = selectShouldBlockApp(state, packageName);

      if (shouldBlock) {
        // Call SirenTier.block() - implementation is platform-specific
        await listenerApi.dispatch(blockDetectedSiren(packageName));
      }
    },
  });
};
```

---

## Architecture Diagram

```
Core Layer (Platform-Agnostic)
├── SirenTier interface
│   ├── target(sirens): Promise<void>
│   └── block(packageName): Promise<void>
│
└── Business logic uses SirenTier via dependency injection

Infrastructure Layer (Platform-Specific)
├── InMemorySirenTier (testing/fallback)
│   └── Logs blocked apps, no actual blocking
│
└── AndroidSirenTier (production - Android)
    └── Uses: expo-blocking-overlay module
        └── Launches: BlockingOverlayActivity
            ├── UI: "This app is blocked" + "Close" button
            └── Close button → Android home screen

Future Implementations
├── IOSSirenTier (iOS)
│   └── Might use ScreenTime API or similar
│
└── WebSirenTier (Web)
    └── Might use browser extension or modal
```

---

## No Database Changes

**Important**: This feature does NOT require database schema changes.

**Why**:
- No persistent state needed
- Overlay is ephemeral (only shown when blocking)
- Block session data already exists in Redux + Prisma
- Package names come from existing Sirens entities

---

## Type Definitions

**Location**: `/core/_ports_/siren.tier.ts` (already exists)

```typescript
import { Sirens } from '@core/siren/sirens'

export interface SirenTier {
  target(sirens: Sirens): Promise<void>
  block(packageName: string): Promise<void>
}
```

**No new types needed** - interface already exists and is sufficient.

---

## Summary

This feature has a **minimal data model** because it's implementing an existing interface:

1. **Port**: `SirenTier` (already exists) - platform-agnostic blocking interface
2. **New Adapter**: `AndroidSirenTier` - implements blocking via overlay Activity
3. **Native Module**: `expo-blocking-overlay` - internal helper (not a port)
4. **Native Activity**: `BlockingOverlayActivity` - UI with "Close" button
5. **No database changes** - overlay is stateless and ephemeral

The design perfectly follows hexagonal architecture:
- Core business logic depends only on `SirenTier` interface
- Android-specific implementation is isolated in infrastructure layer
- Easy to add iOS/Web implementations later without changing core logic
- Testable with `InMemorySirenTier` fake implementation
