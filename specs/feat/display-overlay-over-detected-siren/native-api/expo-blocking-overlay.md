# Native Module API: expo-blocking-overlay

**Module**: Standalone Expo module for launching Android blocking overlays
**Repository**: `github.com/amehmeto/expo-blocking-overlay`
**Platform**: Android only
**Date**: 2025-01-24

## Overview

This is a **standalone Expo module** (separate repository) that provides a native bridge between TypeScript and Android's Activity system. It's used by `AndroidSirenTier` to display fullscreen blocking overlays. The module is designed to be reusable by any React Native + Expo project.

## TypeScript API

### Module Export

```typescript
// expo-blocking-overlay/src/index.ts (in module repository)
export default {
  showOverlay(packageName: string, blockUntil: number): Promise<void>
};
```

### Method: showOverlay

**Purpose**: Launches a fullscreen blocking Activity for the specified Android app

**Signature**:
```typescript
showOverlay(packageName: string, blockUntil: number): Promise<void>
```

**Parameters**:
- `packageName`: Android package name of the blocked app (e.g., "com.facebook.katana")
- `blockUntil`: Unix timestamp in milliseconds when the block expires (used for display only)

**Returns**: Promise that resolves when Activity is successfully launched

**Throws**:
- `ERR_INVALID_PACKAGE`: If packageName is null, undefined, or empty string
- `ERR_OVERLAY_LAUNCH`: If Android fails to start the Activity

**Example**:
```typescript
import ExpoBlockingOverlay from 'expo-blocking-overlay';

try {
  await ExpoBlockingOverlay.showOverlay('com.facebook.katana', Date.now() + 1800000);
  console.log('Blocking overlay launched');
} catch (error) {
  console.error('Failed to launch overlay:', error);
}
```

---

## Kotlin Implementation

### Module Class

**Location**: `android/src/main/java/expo/modules/blockingoverlay/ExpoBlockingOverlayModule.kt` (in module repository)

**Implementation**:
```kotlin
package expo.modules.blockingoverlay

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.util.Log

class ExpoBlockingOverlayModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoBlockingOverlay")

    AsyncFunction("showOverlay") { packageName: String?, blockUntil: Long ->
      try {
        // Validate input
        if (packageName.isNullOrEmpty()) {
          Log.e(TAG, "Invalid packageName: $packageName")
          throw Exception("ERR_INVALID_PACKAGE: Package name cannot be null or empty")
        }

        // Create Intent with proper flags
        val intent = Intent(appContext.reactContext, BlockingOverlayActivity::class.java).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                  Intent.FLAG_ACTIVITY_CLEAR_TASK or
                  Intent.FLAG_ACTIVITY_NO_HISTORY
          putExtra("packageName", packageName)
          putExtra("blockUntil", blockUntil)
        }

        // Launch Activity
        appContext.reactContext?.startActivity(intent)
        Log.d(TAG, "Launched blocking overlay for $packageName")

      } catch (e: Exception) {
        Log.e(TAG, "Failed to launch overlay", e)
        throw Exception("ERR_OVERLAY_LAUNCH: ${e.message}")
      }
    }
  }

  companion object {
    private const val TAG = "ExpoBlockingOverlay"
  }
}
```

### Intent Flags Explained

- **FLAG_ACTIVITY_NEW_TASK**: Launches Activity in a new task (required when starting from non-Activity context)
- **FLAG_ACTIVITY_CLEAR_TASK**: Clears any existing activities in the task, preventing back navigation
- **FLAG_ACTIVITY_NO_HISTORY**: Prevents Activity from being added to back stack

**Result**: User cannot press back button to dismiss overlay or return to blocked app.

### Intent Extras

Passed to `BlockingOverlayActivity`:

| Key | Type | Description |
|-----|------|-------------|
| `packageName` | String | Android package name of blocked app |
| `blockUntil` | Long | Unix timestamp (milliseconds) when block expires |

---

## BlockingOverlayActivity

### Activity Implementation

**Location**: `android/src/main/java/expo/modules/blockingoverlay/BlockingOverlayActivity.kt` (in module repository)

**Implementation**:
```kotlin
package expo.modules.blockingoverlay

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView

class BlockingOverlayActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_blocking_overlay)

    // Read Intent extras
    val packageName = intent.getStringExtra("packageName")
    val blockUntil = intent.getLongExtra("blockUntil", 0)

    // Display blocking message
    findViewById<TextView>(R.id.blockMessage).text = "This app is blocked."

    // Setup Close button
    findViewById<Button>(R.id.closeButton).setOnClickListener {
      launchHomeScreen()
    }
  }

  override fun onBackPressed() {
    // Do nothing - prevent back button dismissal
  }

  private fun launchHomeScreen() {
    val homeIntent = Intent(Intent.ACTION_MAIN).apply {
      addCategory(Intent.CATEGORY_HOME)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    startActivity(homeIntent)
    finish() // Close this Activity
  }
}
```

### Layout XML

**Location**: `android/src/main/res/layout/activity_blocking_overlay.xml` (in module repository)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="32dp"
    android:background="#FFFFFF">

    <TextView
        android:id="@+id/blockMessage"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="This app is blocked."
        android:textSize="24sp"
        android:textColor="#000000"
        android:gravity="center"
        android:layout_marginBottom="32dp" />

    <Button
        android:id="@+id/closeButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Close"
        android:minWidth="200dp"
        android:textSize="18sp" />

</LinearLayout>
```

### AndroidManifest.xml

**Location**: `android/src/main/AndroidManifest.xml` (in module repository)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <activity
            android:name=".BlockingOverlayActivity"
            android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
            android:launchMode="singleTask"
            android:excludeFromRecents="true"
            android:exported="false" />
    </application>
</manifest>
```

**Key attributes**:
- `Theme.NoTitleBar.Fullscreen`: Removes title bar and status bar for fullscreen overlay
- `launchMode="singleTask"`: Ensures only one instance of Activity exists
- `excludeFromRecents="true"`: Doesn't show in recent apps list
- `exported="false"`: Can only be launched by this app

---

## Error Handling

### Error Codes

| Code | Meaning | When Thrown |
|------|---------|-------------|
| `ERR_INVALID_PACKAGE` | Invalid package name | packageName is null, undefined, or empty |
| `ERR_OVERLAY_LAUNCH` | Activity launch failed | Android system rejects Activity start |

### Error Flow

```typescript
// TypeScript
try {
  await ExpoBlockingOverlay.showOverlay('', Date.now());
} catch (error) {
  console.error(error.message); // "ERR_INVALID_PACKAGE: Package name cannot be null or empty"
}
```

### Logging

All errors are logged to Android Logcat with tag `ExpoBlockingOverlay`:

```bash
# View logs
adb logcat | grep ExpoBlockingOverlay

# Example error log
E/ExpoBlockingOverlay: Invalid packageName:
E/ExpoBlockingOverlay: Failed to launch overlay: ERR_INVALID_PACKAGE
```

---

## Testing Strategy

### Unit Tests (TypeScript)

Test the TypeScript wrapper with mocked native module:

```typescript
// __tests__/ExpoBlockingOverlay.test.ts
import ExpoBlockingOverlay from 'expo-blocking-overlay';

jest.mock('expo-blocking-overlay', () => ({
  showOverlay: jest.fn(),
}));

describe('ExpoBlockingOverlay', () => {
  it('calls native method with correct arguments', async () => {
    await ExpoBlockingOverlay.showOverlay('com.facebook.katana', 1234567890);

    expect(ExpoBlockingOverlay.showOverlay).toHaveBeenCalledWith(
      'com.facebook.katana',
      1234567890
    );
  });
});
```

### Integration Tests (Android)

Test native module on physical device:

```kotlin
// androidTest/.../ExpoBlockingOverlayModuleTest.kt
@Test
fun testShowOverlay_launchesActivity() {
    val intent = Intent(context, BlockingOverlayActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
        putExtra("packageName", "com.test.app")
        putExtra("blockUntil", System.currentTimeMillis())
    }

    context.startActivity(intent)

    // Verify Activity is displayed
    onView(withId(R.id.blockMessage)).check(matches(isDisplayed()))
    onView(withId(R.id.closeButton)).check(matches(isDisplayed()))
}

@Test
fun testCloseButton_launchesHomeScreen() {
    // Launch Activity
    // Click close button
    // Verify home screen Intent was sent
}
```

### Manual Tests (Physical Device)

1. Install TiedSiren on Android device (API 26+)
2. Call `ExpoBlockingOverlay.showOverlay('com.facebook.katana', Date.now() + 1800000)`
3. Verify:
   - Overlay appears within 200ms
   - Message displays: "This app is blocked."
   - "Close" button is visible and tappable
   - Back button does nothing
   - Clicking "Close" launches home screen
   - Activity is removed from back stack

---

## Performance

### Launch Time

Target: <200ms from `showOverlay()` call to Activity visible

**Optimization techniques**:
- Simple layout (2 views: TextView + Button)
- No animations or transitions
- Minimal Activity lifecycle logic
- Pre-inflated layout

### Memory

- Activity uses <5MB RAM
- No memory leaks during repeated launches
- Activity is destroyed when user presses "Close"

### Battery

- No background processing
- Activity only exists while displayed
- Minimal battery impact (<0.1% per day)

---

## Platform Requirements

- **Minimum SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 14 (API 34)
- **Permissions**: None required
- **Google Play Services**: Not required

---

## Future Enhancements

### Phase 2: Custom Messages

Allow customizing the blocking message:

```typescript
ExpoBlockingOverlay.showOverlay('com.facebook.katana', blockUntil, {
  message: 'Instagram is blocked. Stay focused!',
});
```

### Phase 3: Countdown Timer

Display time remaining until block expires:

```
This app is blocked.
Unblocks in 23 minutes
[Close]
```

### Phase 4: Motivational Quotes

Show random motivational quote on blocking screen:

```
This app is blocked.

"Focus is more valuable than intelligence."
[Close]
```

---

## References

- Expo Modules API: https://docs.expo.dev/modules/overview/
- Android Activity: https://developer.android.com/reference/android/app/Activity
- Android Intent Flags: https://developer.android.com/reference/android/content/Intent#flags
- GitHub Issue #102: https://github.com/amehmeto/TiedSiren51/issues/102
