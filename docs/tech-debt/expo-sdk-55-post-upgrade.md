# Expo SDK 55 Post-Upgrade Tech Debt

**Priority**: ⚠️ **MEDIUM**
**Created**: February 27, 2026
**Context**: Identified during SDK 51 → 55 upgrade (PR #405)

## Overview

The SDK 55 upgrade resolved the Prisma/New Architecture blocker by migrating to PowerSync. Several items were identified during the upgrade that don't block functionality but should be addressed.

## Items

### 1. `react-native-popup-menu` v0.16.1 — Unmaintained

**Priority**: ⚠️ MEDIUM
**Risk**: Class components with `defaultProps` (deprecated in React 19, removed for function components)
**Impact**: Wraps the entire app via `<MenuProvider>`

Used in:
- `ui/AppWithInitialization.tsx` — `MenuProvider`
- `ui/design-system/components/shared/ThreeDotMenu.tsx` — `Menu`, `MenuOptions`, `MenuTrigger`
- `ui/design-system/components/shared/TiedSMenuOption.tsx` — `MenuOption`

**Why it works now**: `defaultProps` on class components is deprecated but still functional in React 19. No crash risk today.

**Recommendation**: Replace with `zeego` or `@react-native-menu/menu` when time permits. These use native platform menus and support New Architecture.

### 2. `react-native-elements` v3.4.3 — Unmaintained

**Priority**: 📋 LOW
**Risk**: Library uses class components with `defaultProps` internally
**Impact**: Only `CheckBox` is imported (functional component — safe)

Used in:
- `ui/screens/Blocklists/SelectableSirenCard.tsx`

**Recommendation**: Replace `CheckBox` with a custom component or migrate to `@rneui/themed` v4 (the official successor).

### 3. `unstable_enablePackageExports = false` in Metro config

**Priority**: 📋 LOW
**Risk**: SDK 55 defaults this to `true`. Keeping it `false` may prevent some libraries from resolving correctly via `package.json` `exports` field.
**Impact**: Currently required for `firebase` + PowerSync compatibility

Location: `metro.config.cjs:7`

**Recommendation**: Re-evaluate periodically. When `firebase` and `@powersync/*` packages support Metro package exports, flip to `true` (or remove the line to use the default).

### 4. `TouchableHighlight` usage (2 files)

**Priority**: 📋 LOW
**Risk**: None — `TouchableHighlight` still works in RN 0.83
**Impact**: Inconsistent with rest of codebase which uses `Pressable`

Files:
- `ui/screens/Home/shared/IOSCancelButton.tsx`
- `ui/screens/Home/shared/IOSConfirmButton.tsx`

**Recommendation**: Replace with `Pressable` for consistency.

### 5. `@react-navigation/native` override in `package.json`

**Priority**: 📋 LOW
**Risk**: Override pins version to `7.1.28` to match expo-router's exact pin. If expo-router updates its pin, this override may cause version conflicts.
**Impact**: Required to prevent duplicate React context crash in BottomTabBar

Location: `package.json` `overrides` field

**Recommendation**: Remove the override after upgrading to a future expo-router version that resolves this deduplication natively.

## Resolved During Upgrade

- ✅ Prisma/New Architecture blocker — Replaced with PowerSync
- ✅ `Sentry.wrap()` conflict with expo-router v4 — Removed
- ✅ `@react-navigation/native` duplication (7.1.28 vs 7.1.30) — Fixed with npm overrides
- ✅ `strict-mode/index` tab naming for expo-router v4 — Verified correct
- ✅ `ViewStyle`/`TextStyle` mismatch in `TiedSTextLink.tsx` — Fixed
- ✅ `newArchEnabled` config — Not present (correct for SDK 55 where it's mandatory)
- ✅ `experiments.typedRoutes` — Still works in expo-router v4
