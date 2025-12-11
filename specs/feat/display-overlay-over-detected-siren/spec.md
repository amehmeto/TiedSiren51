# Feature Specification: Android Blocking Overlay Launcher

**Feature Branch**: `feat/display-overlay-over-detected-siren`
**Created**: 2025-01-24
**Status**: Draft
**GitHub Issue**: [#102](https://github.com/amehmeto/TiedSiren51/issues/102)
**Dependencies**: [#97](https://github.com/amehmeto/TiedSiren51/issues/97) (App Launch Monitoring), [#101](https://github.com/amehmeto/TiedSiren51/issues/101) (Blocking Decision Logic)
**Related**: [#103](https://github.com/amehmeto/TiedSiren51/issues/103) (Accessibility Permission UX), [#95](https://github.com/amehmeto/TiedSiren51/issues/95) (expo-accessibility-service - COMPLETED)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Blocking Overlay for Detected App (Priority: P1)

When a blocked app is detected by the system, TiedSiren must immediately display a fullscreen overlay that prevents user interaction with the blocked app, ensuring the user cannot bypass the blocking mechanism.

**Why this priority**: This is the core blocking mechanism that delivers the value of TiedSiren - preventing distraction by blocking access to specified apps. Without this, the app cannot fulfill its primary purpose.

**Independent Test**: Can be fully tested by calling `showOverlay('com.facebook.katana', 1718880000)` from JavaScript and verifying that a fullscreen blocking activity appears within 200ms that prevents interaction with the app underneath.

**Acceptance Scenarios**:

1. **Given** the Expo module is correctly initialized
   **When** TiedSiren calls `showOverlay('com.facebook.katana', 1718880000)`
   **Then** a fullscreen blocking activity appears within 200ms
   **And** it displays a blocking message "This app is blocked."
   **And** the user cannot interact with the app underneath

2. **Given** a blocking overlay is displayed
   **When** the user clicks the "Close" button
   **Then** the Android home screen is launched
   **And** the user is taken away from the blocked app

3. **Given** a blocking overlay is displayed
   **When** the user attempts to press the back button
   **Then** the overlay remains on screen and cannot be dismissed
   **And** the back button does nothing

4. **Given** a blocking overlay is displayed
   **When** the user attempts to navigate away using app switcher
   **Then** the overlay stays in focus and blocks navigation

---

### User Story 2 - Graceful Error Handling (Priority: P2)

The overlay system must handle invalid inputs and failure scenarios gracefully without crashing the application, ensuring a reliable user experience even when errors occur.

**Why this priority**: While not the primary feature, robust error handling is critical for production reliability and prevents user frustration from app crashes.

**Independent Test**: Can be tested independently by calling `showOverlay()` with invalid arguments (empty string, null, malformed data) and verifying errors are logged to Logcat without crashing the app.

**Acceptance Scenarios**:

1. **Given** the method is called with an empty or null package name
   **When** the native module attempts to launch the overlay
   **Then** the overlay does not start
   **And** the error is logged to Logcat
   **And** the JS app does not crash

2. **Given** the system denies the activity start (edge case)
   **When** the method is called
   **Then** the error is caught internally
   **And** the user remains in the app
   **And** no crash occurs

---

### Edge Cases

- What happens when `showOverlay()` is called with invalid parameters (empty string, null, undefined)?
- How does the system handle overlay launch failure due to Android system restrictions?
- What happens if the user force-stops the overlay activity from Android system settings?
- How does the overlay behave on devices with custom Android skins (Samsung, Xiaomi, OnePlus)?
- What happens when multiple rapid calls to `showOverlay()` occur?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a TypeScript function `showOverlay(packageName: string, blockUntil: number)` accessible from JavaScript
- **FR-002**: System MUST launch a fullscreen Android Activity with `Intent.FLAG_ACTIVITY_NEW_TASK` and `Intent.FLAG_ACTIVITY_CLEAR_TASK` flags
- **FR-003**: System MUST pass `packageName` and `blockUntil` as extras to the launched Activity
- **FR-004**: Overlay Activity MUST display a static message "This app is blocked."
- **FR-005**: Overlay Activity MUST display a "Close" button that is clearly visible
- **FR-006**: Overlay Activity MUST prevent user interaction with the app underneath
- **FR-007**: Overlay Activity MUST NOT be dismissible via the back button
- **FR-008**: When "Close" button is clicked, system MUST launch Android home screen Intent
- **FR-009**: Overlay Activity MUST appear within 200ms of `block()` being called
- **FR-010**: System MUST log errors to Android Logcat when overlay launch fails
- **FR-011**: System MUST NOT crash the app when invalid parameters are provided
- **FR-012**: System MUST NOT crash the app when overlay launch fails

### Key Entities *(include if feature involves data)*

- **SirenTier**: Existing port interface that defines blocking behavior (platform-agnostic)
- **AndroidSirenTier**: New Android implementation of SirenTier that uses native overlay
- **expo-blocking-overlay**: Standalone Expo module (separate repository) used by AndroidSirenTier
- **BlockingOverlayActivity**: Native Android Activity with "Close" button that launches home screen

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Overlay appears within 200ms of method call (measured via Android performance profiling)
- **SC-002**: Overlay successfully blocks user interaction in 100% of valid test cases
- **SC-003**: System handles invalid parameters without crashing in 100% of error test cases
- **SC-004**: Overlay launches successfully on Android API 26+ devices (95%+ success rate on physical devices)
- **SC-005**: Back button press does not dismiss overlay in 100% of test cases
- **SC-006**: "Close" button launches home screen in 100% of test cases
- **SC-007**: Errors are logged to Logcat in 100% of failure scenarios

## Known Limitations & Future Enhancements

### Accepted Limitations (Current Implementation)

**Limitation 1: Force-Stop Bypass**

**Issue**: User can force-stop the overlay Activity via Android system settings (Settings → Apps → TiedSiren → Force Stop), which terminates the blocking and allows access to blocked app.

**Status**: **Accepted for current implementation**

**Rationale**:
- Requires multiple deliberate steps (Settings → Apps → TiedSiren → Force Stop)
- Similar to uninstalling the app - user has made conscious decision to bypass
- Preventing this requires device admin/system app permissions (too restrictive for general users)
- Re-detection will trigger overlay again when user launches blocked app next time

**Future Enhancement Options** (Not prioritized):

1. **Strict Mode Option** (Far future)
   - Optional setting for users who want stronger blocking
   - Device Admin permissions for harder-to-bypass blocking
   - User explicitly opts into more restrictive mode
   - Still bypassable (Settings → Security → Device Admins → Deactivate)

2. **System App Installation** (Very far future, hardcore users only)
   - Requires rooted Android device
   - App installed as system app in `/system/app/`
   - Much harder to remove/disable
   - Only for highly committed users
   - Not feasible for general Play Store distribution

3. **Kiosk Mode** (Not planned - too restrictive)
   - Locks device to single app
   - Disables home button, back button, settings access
   - Requires device owner permission / MDM enrollment
   - **Rejected**: Too restrictive for productivity app (blocks ALL apps, not just distracting ones)

**Mitigation Strategy (Current)**:
- AccessibilityService continuously monitors for blocked app launches
- If overlay is force-stopped and user opens blocked app again, new overlay launches immediately
- User must force-stop repeatedly for each app launch (creates friction)

---

### Edge Cases - Answers

**Q: What happens when `showOverlay()` is called with invalid parameters?**
- A: Module validates input, throws `ERR_INVALID_PACKAGE` error, logs to Logcat, does not crash app
- Documented in: `native-api/expo-blocking-overlay.md`

**Q: How does the system handle overlay launch failure?**
- A: Catches exception, throws `ERR_OVERLAY_LAUNCH` error, logs to Logcat, does not crash app
- Documented in: `native-api/expo-blocking-overlay.md`

**Q: What happens if user force-stops overlay from system settings?**
- A: Overlay terminates, user can access blocked app. Next time app launches, AccessibilityService detects it and triggers new overlay. **Accepted limitation** (see above).

**Q: How does overlay behave on custom Android skins?**
- A: Uses standard Android Activity APIs, tested on Samsung, Pixel, OnePlus devices
- Intent flags work across manufacturers: `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK | FLAG_ACTIVITY_NO_HISTORY`
- Documented in: `research.md` (Risks & Mitigations section)

**Q: What happens with multiple rapid calls to `showOverlay()`?**
- A: Activity uses `launchMode="singleTask"` in AndroidManifest, ensuring only one instance exists
- Subsequent calls reuse existing Activity instance
- Documented in: `native-api/expo-blocking-overlay.md` (AndroidManifest section)
