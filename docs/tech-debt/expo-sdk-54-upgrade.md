# Expo SDK 54 Upgrade Analysis

**Priority**: 🔴 **BLOCKED**
**Effort**: Very High (2-3 weeks minimum)
**Status**: Blocked by @prisma/react-native
**Created**: December 14, 2025
**Current SDK**: 51 (expo ~51.0.39, react-native 0.74.5)
**Target SDK**: 54

## Executive Summary

Upgrading TiedSiren51 from Expo SDK 51 to SDK 54 is **currently blocked** by `@prisma/react-native`, which does not support the New Architecture enabled by default in SDK 53+. The Prisma team is aware of this issue and working on a TypeScript rewrite expected in H2 2025.

**Recommendation**: Wait for Prisma fix, OR migrate to alternative local database solution.

## Blocker: @prisma/react-native

### Issue Details

- **GitHub Issue**: [prisma/react-native-prisma#58](https://github.com/prisma/react-native-prisma/issues/58)
- **Root Cause**: C++ bindings fail to initialize with New Architecture
- **Error Message**: `prisma/react-native C++ bindings failed to initialize`

### Prisma Team Response

The Prisma team has acknowledged the issue. Their current implementation uses C++ bindings that are incompatible with the New Architecture (Fabric/TurboModules). They are working on a TypeScript-based rewrite.

**Timeline**: Expected H2 2025 (no guaranteed date)

### Temporary Workaround (NOT RECOMMENDED)

Disabling New Architecture allows SDK 53/54 with Prisma, but sacrifices performance benefits:

```json
{
  "expo": {
    "newArchEnabled": false,
    "ios": {
      "jsEngine": "jsc"
    }
  }
}
```

**Why this is not recommended**:
- Loses all New Architecture performance improvements
- JSC is slower than Hermes
- Eventually New Architecture will be required
- Creates more technical debt

## Environment Requirements for SDK 54

| Requirement | SDK 51 (Current) | SDK 54 (Target) |
|-------------|------------------|-----------------|
| Node.js | 18+ | 18+ (22 LTS recommended) |
| Xcode | 15.2 | 16.0+ |
| iOS Deployment Target | 13.4 | 15.1 |
| Android compileSdk | 34 | 35 |
| Android minSdk | 23 | 24 |
| Android targetSdk | 34 | 35 |
| Java | 17 | 17 |
| Gradle | 8.6 | 8.11.1 |
| AGP | 8.3 | 8.9.0 |

## Dependency Compatibility Analysis

### Legend

- 🔴 **BLOCKER**: Prevents upgrade entirely
- 🟡 **HIGH RISK**: Known issues or significant changes required
- 🟠 **MEDIUM RISK**: May need updates or testing
- 🟢 **LOW RISK**: Expected to work with minor or no changes

### Core Dependencies

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `@prisma/react-native` | ^6.0.1 | 🔴 BLOCKER | C++ bindings fail with New Architecture |
| `@prisma/client` | 5.22.0 | 🔴 BLOCKER | Depends on react-native-prisma |
| `expo` | ~51.0.39 | 🟢 LOW RISK | Standard upgrade path |
| `react` | 18.2.0 | 🟡 HIGH RISK | SDK 54 requires React 19.1.0 |
| `react-native` | 0.74.5 | 🟡 HIGH RISK | SDK 54 uses 0.81.x |
| `react-dom` | 18.2.0 | 🟡 HIGH RISK | Must match React version |

### Expo Packages

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `expo-router` | ~3.5.24 | 🟠 MEDIUM RISK | API changes in v4+ |
| `expo-notifications` | ~0.28.19 | 🟠 MEDIUM RISK | Check for API changes |
| `expo-background-fetch` | ^12.0.1 | 🟠 MEDIUM RISK | May have config changes |
| `expo-task-manager` | ^11.8.2 | 🟠 MEDIUM RISK | Related to background-fetch |
| `@expo/vector-icons` | 14.0.3 | 🟢 LOW RISK | Usually compatible |
| `expo-blur` | ~13.0.3 | 🟢 LOW RISK | |
| `expo-constants` | ~16.0.2 | 🟢 LOW RISK | |
| `expo-device` | ~6.0.2 | 🟢 LOW RISK | |
| `expo-font` | ~12.0.10 | 🟢 LOW RISK | |
| `expo-linear-gradient` | ^13.0.2 | 🟢 LOW RISK | |
| `expo-linking` | ~6.3.1 | 🟢 LOW RISK | |
| `expo-navigation-bar` | ~3.0.4 | 🟢 LOW RISK | |
| `expo-splash-screen` | ~0.27.7 | 🟢 LOW RISK | |
| `expo-status-bar` | ~1.12.1 | 🟢 LOW RISK | |
| `expo-system-ui` | ~3.0.7 | 🟢 LOW RISK | |
| `expo-web-browser` | ~13.0.3 | 🟢 LOW RISK | |
| `expo-apple-authentication` | ~6.4.2 | 🟢 LOW RISK | |

### React Native Community Packages

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `react-native-reanimated` | ~3.10.1 | 🟠 MEDIUM RISK | Major version bump expected |
| `react-native-gesture-handler` | ~2.16.1 | 🟠 MEDIUM RISK | Check New Architecture support |
| `react-native-screens` | 3.31.1 | 🟠 MEDIUM RISK | |
| `react-native-safe-area-context` | 4.10.5 | 🟢 LOW RISK | |
| `react-native-pager-view` | 6.3.0 | 🟢 LOW RISK | |
| `@react-native-async-storage/async-storage` | 1.23.1 | 🟢 LOW RISK | |
| `@react-native-community/datetimepicker` | 8.0.1 | 🟢 LOW RISK | |
| `@react-native-google-signin/google-signin` | 10.1.1 | 🟠 MEDIUM RISK | Check SDK 54 compatibility |
| `@react-native-picker/picker` | ^2.7.5 | 🟢 LOW RISK | |

### Third-Party UI Libraries

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `react-native-elements` | ^3.4.3 | 🟡 HIGH RISK | No confirmed React 19 support |
| `react-native-tab-view` | ^3.5.2 | 🟠 MEDIUM RISK | |
| `react-native-popup-menu` | ^0.16.1 | 🟠 MEDIUM RISK | |
| `react-native-modal-datetime-picker` | ^18.0.0 | 🟢 LOW RISK | |

### State Management & Utilities

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `@reduxjs/toolkit` | ^2.2.5 | 🟢 LOW RISK | Framework agnostic |
| `react-redux` | ^9.1.2 | 🟠 MEDIUM RISK | Check React 19 compatibility |
| `formik` | ^2.4.5 | 🟠 MEDIUM RISK | Check React 19 compatibility |
| `date-fns` | ^3.6.0 | 🟢 LOW RISK | No React dependency |
| `zod` | ^3.23.8 | 🟢 LOW RISK | No React dependency |

### External Services

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `firebase` | ^11.9.1 | 🟢 LOW RISK | Web SDK, framework agnostic |
| `@sentry/react-native` | ~5.24.3 | 🟠 MEDIUM RISK | Check SDK 54 support |

### Custom Expo Modules

| Package | Status | Notes |
|---------|--------|-------|
| `@amehmeto/expo-accessibility-service` | 🟢 OK | Uses expo-module-scripts 4.1.9, SDK 53 compatible |
| `@amehmeto/expo-list-installed-apps` | 🟡 NEEDS UPDATE | Uses outdated expo-module-scripts 3.5.1 |
| `@amehmeto/tied-siren-blocking-overlay` | 🟢 OK | Uses expo-module-scripts 4.0.0 |

### Foreground Service Package

| Package | Current Version | SDK 54 Status | Notes |
|---------|-----------------|---------------|-------|
| `foreground-ss` | ^0.1.48 | 🟡 NEEDS FORK | Only supports SDK 53, needs @expo/config-plugins update |

**Current Workaround** (for SDK 51):
```json
{
  "overrides": {
    "foreground-ss": {
      "@expo/config-plugins": "~8.0.0"
    }
  }
}
```

**For SDK 54**: Fork the package and update `@expo/config-plugins` to `~54.0.0`.

## Breaking Changes by SDK Version

### SDK 51 → SDK 52

- **React Native**: 0.74 → 0.76
- **New Architecture**: Available but opt-in
- **expo-router**: API refinements
- **Minimum iOS**: 13.4 → 14.0

### SDK 52 → SDK 53

- **React Native**: 0.76 → 0.78
- **New Architecture**: **ENABLED BY DEFAULT**
- **React**: 18.x → 18.3.x (preparation for 19)
- **Breaking**: Native modules must support New Architecture
- **expo-splash-screen**: New API

### SDK 53 → SDK 54

- **React Native**: 0.78 → 0.81
- **React**: 18.3.x → **19.1.0** (major version bump)
- **Minimum iOS**: 14.0 → 15.1
- **Android**: compileSdk/targetSdk 34 → 35
- **Gradle**: 8.6 → 8.11.1
- **AGP**: 8.3 → 8.9.0
- **Breaking**: All React 19 breaking changes apply

## React 19 Considerations

SDK 54 requires React 19, which has significant changes:

### Breaking Changes
- `ref` is now a regular prop (no more `forwardRef` needed)
- Stricter hydration error handling
- Removed legacy context API
- Actions and `useActionState` for form handling

### Required Code Changes
- Update `forwardRef` usage patterns
- Review form handling for new Actions pattern
- Test all components for hydration issues (web)
- Update React types in TypeScript

## Migration Options

### Option 1: Wait for Prisma Fix (RECOMMENDED)

**Timeline**: H2 2025 (estimated)
**Effort**: Low (just wait)
**Risk**: Low

Wait for the Prisma team to release a TypeScript-based version that supports New Architecture.

**Pros**:
- No migration effort
- Maintains current architecture
- Prisma is well-tested and feature-rich

**Cons**:
- Uncertain timeline
- Stuck on SDK 51 until then

### Option 2: Migrate to expo-sqlite

**Timeline**: 2-3 weeks
**Effort**: High
**Risk**: Medium

Replace Prisma with Expo's built-in SQLite solution.

**Pros**:
- Native Expo support, always compatible
- Lighter weight
- No C++ bindings

**Cons**:
- Lose Prisma's type-safe query builder
- Manual migration script needed
- Less feature-rich

### Option 3: Migrate to WatermelonDB

**Timeline**: 3-4 weeks
**Effort**: Very High
**Risk**: Medium-High

Replace Prisma with WatermelonDB, a high-performance React Native database.

**Pros**:
- Excellent performance
- Sync capabilities
- Active community

**Cons**:
- Different paradigm (reactive)
- Steep learning curve
- Significant refactoring

### Option 4: Upgrade with New Architecture Disabled

**Timeline**: 1-2 weeks
**Effort**: Medium
**Risk**: High (technical debt)

Upgrade to SDK 54 but disable New Architecture.

**Pros**:
- Faster path to SDK 54
- Most packages will work

**Cons**:
- Loses performance benefits
- Will need to enable New Architecture eventually
- Creates more technical debt

## Implementation Plan (When Blocker is Resolved)

### Phase 1: Preparation (1-2 days)
- [ ] Fork `foreground-ss` and update config-plugins
- [ ] Update `@amehmeto/expo-list-installed-apps` dependencies
- [ ] Review React 19 migration guide
- [ ] Create feature branch for upgrade

### Phase 2: SDK Upgrade (2-3 days)
- [ ] Run `npx expo install --fix`
- [ ] Update manual version pins
- [ ] Resolve peer dependency conflicts
- [ ] Update native project files (prebuild)

### Phase 3: Code Migration (3-5 days)
- [ ] Update forwardRef patterns for React 19
- [ ] Update form handling if using Actions
- [ ] Fix any deprecated API usage
- [ ] Update custom expo modules if needed

### Phase 4: Testing (3-5 days)
- [ ] Run full test suite
- [ ] Manual testing on iOS simulator
- [ ] Manual testing on Android emulator
- [ ] Test on physical devices
- [ ] Test all block session scenarios
- [ ] Test foreground service behavior

### Phase 5: Stabilization (2-3 days)
- [ ] Fix issues found in testing
- [ ] Performance testing
- [ ] Memory leak testing
- [ ] Battery usage testing

## Recommended Action Items

### Immediate (Before Prisma Fix Available)
1. **Monitor** [prisma/react-native-prisma#58](https://github.com/prisma/react-native-prisma/issues/58) for updates
2. **Evaluate** expo-sqlite as backup migration path
3. **Update** `@amehmeto/expo-list-installed-apps` dependencies preemptively
4. **Fork** `foreground-ss` and maintain SDK-flexible version

### When Prisma Fix is Released
1. Test Prisma update in isolation
2. Proceed with SDK 54 upgrade plan
3. Allow 1-2 sprint buffer for unexpected issues

## Risk Assessment Summary

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Prisma never fixes issue | Very High | Low | Migration to expo-sqlite planned |
| React 19 breaks UI libraries | High | Medium | Test early, have fallback versions |
| Custom modules incompatible | Medium | Low | Already SDK 53 compatible mostly |
| Performance regression | Medium | Low | Benchmark before/after |
| Data loss during migration | Very High | Very Low | Backup strategy, staged rollout |

## Related Documentation

- [Migration Strategy](migration-strategy.md) - Database migration approach
- [Prisma Client Generation](prisma-client-generation.md) - Current Prisma setup
- [Database Configuration](database-configuration.md) - Database paths and config

## External References

- [Expo SDK 54 Release Notes](https://expo.dev/changelog) (when available)
- [React 19 Migration Guide](https://react.dev/blog/2024/04/25/react-19)
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [prisma/react-native-prisma Issue #58](https://github.com/prisma/react-native-prisma/issues/58)
- [foreground-ss Repository](https://github.com/saltmurai/foreground)

## Revision History

| Date | Change |
|------|--------|
| 2025-12-14 | Initial analysis created |
