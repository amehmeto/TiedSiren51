# GitHub Issues Sync Report

**Feature**: Android Blocking Overlay Implementation
**Date**: 2025-01-24
**Branch**: `feat/display-overlay-over-detected-siren`

## Summary

This report analyzes existing GitHub issues related to the Android blocking overlay feature and identifies what needs updating based on the architectural refinements made during speckit planning.

---

## Current Issue: #102

**Title**: "Internal Expo Module: Android Blocking Overlay Launcher - 1 sp"
**Status**: Open
**Link**: https://github.com/amehmeto/TiedSiren51/issues/102

### Discrepancies with Current Planning

| Issue #102 States | Current Planning Says | Action Needed |
|-------------------|----------------------|---------------|
| "Internal Expo module exists inside the TiedSiren codebase" | Module must be standalone in separate repository (expo-blocking-overlay) | Update issue to reflect standalone module approach |
| "No navigation, no interactivity" | Overlay has "Close" button that redirects to Android home screen | Add Close button requirement to issue |
| References "BlockingActivity" | Standardized name is "BlockingOverlayActivity" | Update naming throughout issue |
| No mention of architecture | Uses AndroidSirenTier implementing SirenTier port interface | Add architectural context to issue |
| Describes module as "internal-only" | Module is reusable, public, separate repository | Update scope description |

### Recommended Updates to Issue #102

**Section: Expo Module**
- ❌ Remove: "Internal Expo module exists inside the TiedSiren codebase"
- ✅ Add: "Standalone Expo module in separate repository: `github.com/amehmeto/expo-blocking-overlay`"
- ✅ Add: "Module consumed as external dependency via package.json"
- ✅ Add: "Module is reusable by any React Native + Expo project"

**Section: Overlay Activity**
- ❌ Remove: "No navigation, no interactivity"
- ✅ Add: "Displays a 'Close' button that redirects user to Android home screen"
- ✅ Add: "Close button uses Intent.ACTION_MAIN + Intent.CATEGORY_HOME"
- ✅ Update: "BlockingActivity" → "BlockingOverlayActivity" everywhere

**Section: Architecture Context (NEW)**
- ✅ Add: "Implements AndroidSirenTier adapter in `/infra/siren-tier/`"
- ✅ Add: "AndroidSirenTier implements existing SirenTier port interface"
- ✅ Add: "No new port interface needed - uses existing abstraction"
- ✅ Add: "Follows hexagonal architecture: Core → SirenTier port → AndroidSirenTier adapter → expo-blocking-overlay module"

**Section: Definition of Done**
- ✅ Add: "Close button successfully redirects to Android home screen"
- ✅ Add: "AndroidSirenTier implements SirenTier interface correctly"
- ✅ Add: "Module published to separate repository with README"
- ✅ Update: "Expo module follows standalone standards (separate repo, reusable API, no TiedSiren-specific logic)"

---

## Dependency Chain Analysis

### Completed Work

**#95: Create expo-accessibility-service Module - CLOSED ✅**
- **Status**: Completed and closed
- **What was delivered**: Standalone module with `isEnabled()` and `askPermission()` methods
- **Architecture**: Already follows standalone module principle ✅
- **Repository**: `github.com/amehmeto/expo-accessibility-service`
- **Impact on #102**: Foundation is complete, no blockers

### Open Dependencies (Must complete before #102)

**#97: App Launch Monitoring via AccessibilityService - 2 sp**
- **Status**: Open, assigned
- **What it does**: Extends expo-accessibility-service to emit app launch events to JavaScript
- **API**: `addAccessibilityEventListener(listener)` → returns `Subscription`
- **Dependency relationship**: #102 needs app detection events to trigger blocking
- **Architecture**: Standalone module (follows our principle) ✅
- **Recommendation**: Complete before starting #102 implementation

**#101: Blocking Decision Logic - 2 sp**
- **Status**: Open, no assignee
- **What it does**: Core Redux logic to determine `shouldBlockApp(packageName)`
- **Architecture**: Pure domain logic in `/core/siren/` using Redux selectors
- **Dependency relationship**: #102 calls SirenTier.block() only when #101 decides blocking is needed
- **Recommendation**: Complete before starting #102 implementation

**#103: Handle Accessibility Permission on App Start - 3 sp**
- **Status**: Open, no assignee
- **What it does**: UX flow to request accessibility permission on app startup
- **Architecture**: UI layer + Redux state management
- **Dependency relationship**: Permission must be granted for #102 blocking to work
- **Recommendation**: Can be done in parallel with #102, but blocks testing

### Recommended Implementation Order

```
1. #97: App Launch Monitoring (expo-accessibility-service event emission)
   └─ Enables: App detection events available to TiedSiren

2. #101: Blocking Decision Logic (shouldBlockApp() in Redux)
   └─ Enables: Core knows when to trigger blocking

3. #102: Android Blocking Overlay (THIS FEATURE)
   └─ Enables: Actual blocking via overlay Activity

4. #103: Permission Handling UX (Permission flow on app start)
   └─ Enables: Complete user experience with permission setup
```

**Critical path**: #97 → #101 → #102
**Parallel track**: #103 (can start anytime, blocks end-to-end testing)

---

## Related Open Issues (Context)

**#96: Setup Phase - Guided Permission Setup - 3sp**
- Permission setup wizard flow
- Related to #103 (both handle permission UX)
- Not a blocker for #102

**#100: Port Pattern Refinement**
- Architectural discussion about port interfaces
- Already resolved in our planning (SirenTier exists, no new port needed)
- No action needed

---

## Architecture Alignment

### What's Already Aligned ✅

1. **Standalone Module Principle**: Issue #95 (expo-accessibility-service) already follows separate repository approach
2. **Hexagonal Architecture**: Issues reference ports, adapters, Redux patterns correctly
3. **Platform-Agnostic Design**: Issues understand Android-specific implementation vs. interface design
4. **No I-Prefix Convention**: Issues don't use I-prefix naming (already following convention)

### What Needs Updating ⚠️

1. **Issue #102**: Update to reflect standalone module + Close button + AndroidSirenTier architecture
2. **Issue Labels**: Add `standalone-module` label to #102 to distinguish from internal code
3. **Issue Relationships**: Document dependency chain in GitHub (using "Depends on #97, #101")

---

## Recommendations

### Immediate Actions

1. **Update Issue #102** with architectural refinements:
   - Standalone module approach
   - Close button requirement
   - AndroidSirenTier architecture context
   - Updated naming (BlockingOverlayActivity)

2. **Add GitHub Issue Links** in planning docs:
   - spec.md header: Add "**GitHub Issue**: #102"
   - plan.md: Reference related issues #97, #101, #103

3. **Create Task Dependencies** when generating tasks.md:
   - Mark tasks dependent on #97 completion
   - Mark tasks dependent on #101 completion
   - Separate module creation from TiedSiren integration

### Before Task Generation

- ✅ Sync complete: We have full visibility into existing work
- ✅ Dependencies identified: #97 and #101 must complete first
- ✅ Completed work noted: #95 (expo-accessibility-service base) is done
- ⚠️ Issue #102 needs updating: Use findings above to update GitHub issue
- ✅ Ready to generate tasks.md: Can proceed with /speckit.tasks after updating #102

---

## Changes Summary

**What Changed During Planning**:
1. ❌ Internal module → ✅ Standalone separate repository
2. ❌ No Close button → ✅ Close button redirects to home screen
3. ❌ No architecture context → ✅ AndroidSirenTier implements SirenTier
4. ❌ "BlockingActivity" → ✅ "BlockingOverlayActivity"
5. ✅ New ADRs created: `standalone-expo-modules.md`, `port-naming-convention.md`
6. ✅ Edge cases documented: Force-stop limitation accepted, future enhancements planned

**Impact**:
- Issue #102 description is outdated
- All planning docs (spec.md, plan.md, etc.) reflect current architecture
- Task generation should use updated planning, not outdated issue description
- Issue should be updated to match planning before implementation starts
