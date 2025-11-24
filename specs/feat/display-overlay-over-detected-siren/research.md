# Research: Android Blocking Overlay Launcher

**Date**: 2025-01-24
**Feature**: Android Blocking Overlay Launcher

## Research Topics

### 1. Expo Modules API for Standalone Modules

**Decision**: Use Expo Modules API with TypeScript + Kotlin, developed in separate repository

**Rationale**:
- Project already uses Expo SDK ~51 with established module patterns
- Expo Modules API provides type-safe bridge between JavaScript and native code
- Simplifies native module development with decorators and auto-generated TypeScript types
- Standalone modules can be reused across projects and shared with community
- Consistent with project's existing architecture (already uses `@amehmeto/expo-accessibility-service` and `@amehmeto/expo-list-installed-apps`)
- All Expo modules must live in separate repositories (project principle)

**Alternatives Considered**:
- **Raw React Native Native Modules**: More boilerplate, manual type definitions, less integration with Expo tooling
- **Turbo Modules**: Overkill for simple overlay launcher, requires more setup
- **Internal module in TiedSiren51 repo**: Violates project principle of standalone Expo modules

**Implementation References**:
- Expo Modules API docs: https://docs.expo.dev/modules/overview/
- Existing module pattern: `github.com/amehmeto/expo-accessibility-service`
- Module repository: `github.com/amehmeto/expo-blocking-overlay`
- ADR: [Standalone Expo Modules](../../../docs/adr/infrastructure/standalone-expo-modules.md)

---

### 2. Android Intent Flags for Non-Dismissible Activities

**Decision**: Use `Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY`

**Rationale**:
- `FLAG_ACTIVITY_NEW_TASK`: Launches activity in new task (required when starting from non-activity context)
- `FLAG_ACTIVITY_CLEAR_TASK`: Clears any existing activities in the task, preventing back navigation
- `FLAG_ACTIVITY_NO_HISTORY`: Prevents activity from being added to back stack
- Combined with `onBackPressed()` override in Activity prevents user dismissal
- System-level approach that works across all Android versions and manufacturers

**Alternatives Considered**:
- **FLAG_ACTIVITY_NO_ANIMATION**: Would skip transition animations but doesn't prevent back button
- **Window flags (TYPE_APPLICATION_OVERLAY)**: Requires SYSTEM_ALERT_WINDOW permission, more complex UX
- **Lock task mode (kiosk mode)**: Requires device owner permission, too restrictive

**Implementation Pattern**:
```kotlin
val intent = Intent(context, BlockingOverlayActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TASK or
            Intent.FLAG_ACTIVITY_NO_HISTORY
    putExtra("packageName", packageName)
    putExtra("blockUntil", blockUntil)
}
context.startActivity(intent)
```

---

### 3. Android Activity Lifecycle for Blocking Overlays

**Decision**: Use simple Activity with `onBackPressed()` override and no finish() calls

**Rationale**:
- Override `onBackPressed()` to no-op prevents back button dismissal
- Do not call `finish()` anywhere to keep activity alive
- Minimal lifecycle management needed - activity should stay in foreground until explicitly dismissed
- Use `Activity` base class, not `ComponentActivity` (don't need Jetpack Compose)

**Alternatives Considered**:
- **Dialog/AlertDialog**: Can be dismissed too easily, not fullscreen by default
- **Service with overlay window**: Requires additional permissions, more complex
- **Fragment**: Still needs parent Activity, adds unnecessary complexity

**Implementation Pattern**:
```kotlin
class BlockingOverlayActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_blocking_overlay)

        val packageName = intent.getStringExtra("packageName")
        val blockUntil = intent.getLongExtra("blockUntil", 0)

        // Display blocking message
        findViewById<TextView>(R.id.blockMessage).text =
            "This app is blocked."
    }

    override fun onBackPressed() {
        // Do nothing - prevent back button dismissal
    }
}
```

---

### 4. Error Handling in Expo Modules

**Decision**: Use try-catch with Promise rejection + Logcat logging for all errors

**Rationale**:
- Expo Modules API supports Promise-based methods that can reject with errors
- JavaScript can catch rejected promises without crashing the app
- Android Logcat provides debugging visibility for native errors
- Graceful degradation: log error, reject promise, but don't crash app

**Alternatives Considered**:
- **Throwing exceptions**: Would crash the app if uncaught
- **Silent failures**: Poor debugging experience
- **Callback-based errors**: Promises are more idiomatic in modern JavaScript

**Implementation Pattern**:
```kotlin
@ExpoMethod
fun showOverlay(packageName: String?, blockUntil: Long, promise: Promise) {
    try {
        if (packageName.isNullOrEmpty()) {
            Log.e(TAG, "Invalid packageName: $packageName")
            promise.reject("ERR_INVALID_PACKAGE", "Package name cannot be null or empty")
            return
        }

        val intent = Intent(context, BlockingOverlayActivity::class.java).apply {
            // ... intent setup
        }

        context.startActivity(intent)
        promise.resolve(true)

    } catch (e: Exception) {
        Log.e(TAG, "Failed to launch overlay", e)
        promise.reject("ERR_OVERLAY_LAUNCH", "Failed to launch overlay: ${e.message}", e)
    }
}
```

---

### 5. Testing Strategies for Native Android Modules

**Decision**: Multi-layer testing - TypeScript unit tests, Android instrumentation tests, manual physical device testing

**Rationale**:
- **TypeScript unit tests**: Test JavaScript interface with fake implementation (Vitest)
- **Android instrumentation tests**: Test native Activity launch and intent extras (Android Test framework)
- **Physical device testing**: Required for full end-to-end validation (AccessibilityService limitations on emulators)
- Separation of concerns allows testing at each layer independently

**Alternatives Considered**:
- **Emulator-only testing**: Cannot test AccessibilityService integration fully
- **Manual testing only**: No regression detection, time-consuming
- **E2E tests with Detox/Maestro**: Overkill for simple module, slow feedback loop

**Testing Strategy**:
1. **TypeScript layer** (`/core`, `/infra`):
   - Unit test `IOverlayService` port interface
   - Test fake implementation (`FakeOverlayService`)
   - Verify dependency injection wiring

2. **Native layer** (`/modules/expo-blocking-overlay`):
   - Android instrumentation test for Activity launch
   - Verify intent extras passed correctly
   - Test error scenarios (null packageName, etc.)

3. **Integration layer**:
   - Manual testing on physical Android devices (Samsung, Pixel, OnePlus)
   - Test API 26, 29, 31, 33, 34
   - Verify <200ms launch time with Android Profiler

---

## Implementation Checklist

Based on research findings, the implementation requires:

### Native Module (`/modules/expo-blocking-overlay/`)
- [x] Research Expo Modules API patterns
- [x] Research Intent flags for non-dismissible activities
- [x] Research Activity lifecycle management
- [x] Research error handling patterns
- [x] Research testing strategies

### Infrastructure Adapter (`/infra/siren-tier/`)
- [ ] Implement `AndroidSirenTier` class (implements existing `SirenTier` interface)
- [ ] `target()` method: Store targeted sirens
- [ ] `block()` method: Call `ExpoBlockingOverlay.showOverlay()`
- [ ] Platform check: Only works on Android

### Dependency Injection (`/ui/dependencies.ts`)
- [ ] Wire `AndroidSirenTier` for Android platform
- [ ] Keep `InMemorySirenTier` for iOS/Web (until implemented)
- [ ] No changes to `Dependencies` type (SirenTier already exists)

### Integration (Already exists in `/core/siren/`)
- [ ] Core logic already uses `SirenTier.block()` via dependency injection
- [ ] Listeners already detect blocked apps
- [ ] No changes needed to core business logic

### Testing
- [ ] TypeScript unit tests for `AndroidSirenTier`
- [ ] Android instrumentation tests for Activity
- [ ] Manual testing on 3+ physical devices (Samsung, Pixel, OnePlus)
- [ ] Performance validation (<200ms launch time)

---

## Risks & Mitigations

### Risk: Manufacturer-specific Android behaviors
**Mitigation**: Test on Samsung, OnePlus, Xiaomi, Google Pixel devices. Document any manufacturer-specific issues. Intent flags chosen are standard Android APIs with broad compatibility.

### Risk: Overlay doesn't appear within 200ms
**Mitigation**: Profile with Android Profiler. Use lightweight Activity with minimal layout. Avoid animations or complex initialization.

### Risk: User finds way to dismiss overlay
**Mitigation**: Use `FLAG_ACTIVITY_CLEAR_TASK` + `onBackPressed()` override + `FLAG_ACTIVITY_NO_HISTORY`. Remove all finish() calls. Test thoroughly on physical devices.

### Risk: Module errors crash the app
**Mitigation**: Comprehensive try-catch blocks, Promise rejection instead of throwing, Logcat logging for debugging, graceful degradation.

---

## References

- Expo Modules API: https://docs.expo.dev/modules/overview/
- Android Intent Flags: https://developer.android.com/reference/android/content/Intent#flags
- Android Activity Lifecycle: https://developer.android.com/guide/components/activities/activity-lifecycle
- Existing module: `@amehmeto/expo-accessibility-service` (similar patterns)
- GitHub Issue #102: https://github.com/amehmeto/TiedSiren51/issues/102
