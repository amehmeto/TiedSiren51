# Accessibility Service Justification

## For Google Play Permission Declaration Form

---

### Core Functionality Description

TiedSiren is a digital wellbeing and productivity app that helps users block distracting apps and websites during self-imposed focus sessions. The AccessibilityService is essential to this core functionality — it is the only Android API that allows detecting which app or website is currently in the foreground so the app can enforce user-configured blocking rules.

### Why AccessibilityService Is Required

TiedSiren needs to know the currently active app or browser URL to determine if it matches the user's blocklist. Android does not provide an alternative API for real-time foreground app detection that is reliable enough for this use case:

- `UsageStatsManager` provides historical data with delays, not real-time detection
- There is no public API to read the current browser URL without AccessibilityService

The AccessibilityService is the only mechanism to achieve the app's core purpose of real-time, rule-based app and website blocking.

### How the AccessibilityService Is Used

1. **Trigger:** The service activates only when the user starts a block session
2. **Detection:** It listens for `TYPE_WINDOW_STATE_CHANGED` and `TYPE_WINDOW_CONTENT_CHANGED` events
3. **Matching:** The active window's package name (for apps) or URL bar content (for browsers) is compared against the user's blocklist
4. **Action:** If a match is found, a full-screen blocking overlay is displayed, prompting the user to return to a productive app
5. **Termination:** The service stops when the block session ends

### What the Service Does NOT Do

- Does NOT collect, log, store, or transmit any data from AccessibilityService events
- Does NOT read screen content beyond the window title / URL bar
- Does NOT interact with, modify, or control other apps' UI elements
- Does NOT perform clicks, gestures, or any automated actions on behalf of the user
- Does NOT operate when no block session is active
- Does NOT run autonomously — all behavior is strictly rule-based and user-configured

### Behavioral Characteristics

- **Deterministic:** The service performs a simple string match (package name or URL) against a user-defined list. There is no AI, ML, or heuristic decision-making.
- **User-initiated:** The service only runs during active block sessions that the user explicitly starts.
- **Transparent:** A foreground notification is displayed whenever the service is active.
- **Revocable:** The user can disable the AccessibilityService at any time via Android Settings, or simply not start a block session.

### Data Handling

- Zero data collection from AccessibilityService events
- No analytics or telemetry derived from AccessibilityService
- No data sharing with any third party
- All processing happens on-device in real-time

### Target User Group

The app serves users who want to voluntarily limit their own device usage for productivity, studying, sleep hygiene, or digital wellbeing purposes. It is comparable to built-in Android Digital Wellbeing features and other established app blockers in the Productivity category.

### Alternative APIs Considered

| API | Why Insufficient |
|-----|-----------------|
| UsageStatsManager | Provides usage history, not real-time foreground detection. Has polling delays (5+ seconds) making it ineffective for immediate blocking. |
| ActivityManager.getRunningTasks() | Deprecated since API 21, returns only own app's tasks. |
| MediaSessionManager | Only works for media apps, not general app detection. |
| AppOpsManager | Cannot detect foreground app in real-time. |

### Summary

TiedSiren's use of AccessibilityService is narrowly scoped to its core functionality of app and website blocking during user-initiated focus sessions. It collects no data, performs no automated actions, and operates transparently with user consent. The AccessibilityService is the only viable Android API for the real-time foreground detection required to deliver this functionality.
