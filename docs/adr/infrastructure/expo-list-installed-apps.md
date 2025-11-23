# Expo List Installed Apps Module

Date: 2025-11-23

## Status

Accepted

## Context

TiedSiren51's core feature is blocking distracting apps. To block apps, we must:

- **Discover installed apps**: Get list of all apps on user's device
- **Filter apps**: Show only user-installed apps (exclude system apps)
- **Display app info**: Show app name, icon, package name
- **Cross-platform**: Support Android (iOS future consideration)

Requirements:
- Access device's installed applications list
- Retrieve app metadata (name, icon, package, version)
- Filter system apps vs user apps
- Sort apps alphabetically for better UX
- Map external app format to domain model

Constraints:
- React Native doesn't provide native API for listing apps
- Expo managed workflow limits native module usage
- Must request permissions on Android
- iOS App Store policies restrict querying installed apps
- Need custom native module for this functionality

## Decision

Use a **custom Expo module** (`@amehmeto/expo-list-installed-apps`) to access installed apps, implemented through an `InstalledAppRepository` port adapter.

### Implementation

**1. Port Definition** (`core/_ports_/installed-app.repository.ts`):

```typescript
export interface InstalledAppRepository {
  getInstalledApps(): Promise<InstalledApp[]>
}
```

**2. Domain Model** (`core/installed-app/InstalledApp.ts`):

```typescript
export interface InstalledApp {
  packageName: string
  versionName: string
  versionCode: number
  firstInstallTime: number
  lastUpdateTime: number
  appName: string
  icon: string  // Base64 encoded image
  apkDir: string
  size: number
}
```

**3. Expo Module Adapter** (`infra/installed-apps-repository/expo-list-installed-apps.repository.ts`):

```typescript
export class ExpoListInstalledAppsRepository implements InstalledAppRepository {
  async getInstalledApps(): Promise<AppModel[]> {
    const installedApps = await listInstalledApps({
      type: AppType.USER,  // Only user-installed apps
    })

    const sortedApps = installedApps
      .sort((a, b) => a.appName.localeCompare(b.appName))
      .map((app) => ({
        packageName: app.packageName,
        versionName: app.versionName,
        versionCode: app.versionCode,
        firstInstallTime: app.firstInstallTime,
        lastUpdateTime: app.lastUpdateTime,
        appName: app.appName,
        icon: app.icon,  // Base64 string
        apkDir: app.apkDir,
        size: app.size,
      }))

    return sortedApps
  }
}
```

**4. Usage in Domain Layer**:

```typescript
// In siren selection screen
const installedApps = await installedAppRepository.getInstalledApps()

// User can then select apps to block
const selectedApp = installedApps.find(app => app.packageName === 'com.instagram')
```

**5. Custom Expo Module**:

The `@amehmeto/expo-list-installed-apps` module:
- Written in Kotlin (Android native)
- Exposes React Native bridge method `listInstalledApps()`
- Returns app metadata including base64 encoded icons
- Filters system apps when `AppType.USER` specified

**6. Fake Implementation for Testing**:

```typescript
export class FakeInstalledAppsRepository implements InstalledAppRepository {
  constructor(private apps: InstalledApp[] = []) {}

  async getInstalledApps(): Promise<InstalledApp[]> {
    return this.apps
  }
}
```

## Consequences

### Positive

- **Native performance**: Direct access to Android PackageManager
- **Complete metadata**: Access to all app information
- **Icon support**: Base64 encoded icons for UI display
- **Filtered results**: Can filter system vs user apps
- **Sorted output**: Alphabetically sorted for better UX
- **Type-safe**: TypeScript definitions for app data
- **Port abstraction**: Core domain isolated from native module
- **Custom control**: Own the implementation, can extend as needed
- **Testing**: Fake implementation for unit tests

### Negative

- **Android only**: iOS doesn't allow querying installed apps
- **Maintenance burden**: Must maintain custom native module
- **Permissions required**: Android QUERY_ALL_PACKAGES permission (restricted)
- **Play Store policy**: Google restricts apps that query all packages
- **Updates needed**: Must update for Android API changes
- **Bundle size**: Adds native module to app size
- **Development complexity**: Requires native Android knowledge
- **Limited Expo integration**: Custom module outside Expo SDK

### Neutral

- **Platform-specific**: Only works on Android
- **Base64 icons**: Icons as strings (memory overhead vs network requests)
- **Module publishing**: Must maintain package on npm

## Alternatives Considered

### 1. React Native Installed Apps

Community library `react-native-installed-apps`.

**Rejected because**:
- Requires bare workflow (incompatible with Expo managed)
- Abandoned/unmaintained
- No TypeScript support
- Limited documentation

### 2. Expo Dev Client + Config Plugin

Use Expo config plugin with custom native module.

**Rejected because**:
- More complex setup
- Requires ejecting to bare workflow
- Loses Expo managed benefits
- Custom module already works with Expo

### 3. Hardcoded App List

Manually maintain list of popular distracting apps.

**Rejected because**:
- Limited coverage (misses user's specific apps)
- High maintenance burden
- Poor user experience
- Doesn't scale internationally

### 4. User Manual Entry

Let users manually type app package names.

**Rejected because**:
- Terrible UX (users don't know package names)
- Error-prone
- No app icons
- Defeats purpose of convenience

### 5. Server-Side App Database

Query a database of known apps.

**Rejected because**:
- Doesn't show what's actually installed on device
- Requires network connection
- Incomplete data
- Doesn't support custom/local apps

## Implementation Notes

### Android Permissions

Required in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
```

**Important**: Google Play restricts this permission. App must:
- Have legitimate use case (app blocking is valid)
- Declare usage in Play Store submission
- May require Play Store review approval

### Module API

```typescript
import { listInstalledApps, AppType } from '@amehmeto/expo-list-installed-apps'

// Get all user-installed apps
const apps = await listInstalledApps({ type: AppType.USER })

// Get all apps (including system)
const allApps = await listInstalledApps({ type: AppType.ALL })
```

### App Data Structure

```typescript
interface InstalledApp {
  packageName: string       // e.g., "com.instagram.android"
  versionName: string       // e.g., "285.0.0.31.100"
  versionCode: number       // Internal version number
  firstInstallTime: number  // Unix timestamp
  lastUpdateTime: number    // Unix timestamp
  appName: string           // e.g., "Instagram"
  icon: string              // Base64 encoded PNG
  apkDir: string            // Path to APK file
  size: number              // App size in bytes
}
```

### Icon Handling

Icons are returned as base64 strings:
```typescript
const iconUri = `data:image/png;base64,${app.icon}`
<Image source={{ uri: iconUri }} />
```

**Considerations**:
- Base64 strings are large (memory overhead)
- Alternative: Save to filesystem and use file URIs
- Current approach: Simpler, works well for reasonable app counts

### iOS Considerations

iOS App Store guidelines prohibit querying installed apps for privacy reasons. Possible workarounds:

1. **URL Schemes**: Check if specific apps can be opened (limited)
2. **Manual Selection**: Hardcoded list of popular apps
3. **Not Supported**: Accept Android-only for this feature

Currently: Feature is Android-only.

### Performance

- **Fetching apps**: ~100-500ms depending on device
- **Icon encoding**: Included in fetch time
- **Sorting**: Minimal overhead
- **Caching**: Consider caching results (apps don't change often)

### Module Development

To update the native module:

1. Clone `expo-list-installed-apps` repository
2. Modify Kotlin code in `android/src/main/java/`
3. Test with example app
4. Publish updated version to npm
5. Update dependency in TiedSiren51

## Related ADRs

- [Hexagonal Architecture](../core/hexagonal-architecture.md) - Port/adapter pattern
- [Repository Pattern](../core/repository-pattern.md) - Data access abstraction

## References

- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Android PackageManager](https://developer.android.com/reference/android/content/pm/PackageManager)
- [QUERY_ALL_PACKAGES Permission](https://developer.android.com/training/package-visibility)
- [Google Play Policy on QUERY_ALL_PACKAGES](https://support.google.com/googleplay/android-developer/answer/10158779)
- Implementation: `infra/installed-apps-repository/expo-list-installed-apps.repository.ts`
- Module: `@amehmeto/expo-list-installed-apps` (npm)
