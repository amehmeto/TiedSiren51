# Technical Debt & Future Improvements

> Created: January 28, 2025
> Last Updated: February 27, 2026
> Status: Living document
> Purpose: Track planned improvements across the codebase

## Overview

This directory tracks technical debt and planned improvements for TiedSiren51. Each file represents a specific area of concern or improvement opportunity.

## Active Technical Debt Items

### Infrastructure & Database
- [Expo SDK 55 Post-Upgrade](expo-sdk-55-post-upgrade.md) - ⚠️ **MEDIUM PRIORITY** - Unmaintained deps (`react-native-popup-menu`, `react-native-elements`), Metro package exports disabled, `@react-navigation/native` override
- [Error Handling Enhancement](error-handling.md) - 🚨 **HIGH PRIORITY** - Custom error types needed
- [Database Configuration](database-configuration.md) - 📋 **LOW PRIORITY** - Configurable paths
- [Migration Strategy](migration-strategy.md) - ⚠️ **MEDIUM PRIORITY** - Critical for app updates
- [Performance Optimization](performance-optimization.md) - 📊 **LOW PRIORITY** - Monitor and optimize

### Testing
- [Testing Coverage](testing-coverage.md) - ⚠️ **MEDIUM PRIORITY** - Integration tests

### UI/UX
- [Android Time Picker Styling](android-time-picker-styling.md) - 📋 **LOW PRIORITY** - Border radius not supported on Android
- [Android Time Picker Double Selection](android-time-picker-double-selection.md) - 📋 **LOW PRIORITY** - Upstream `react-native-modal-datetime-picker` race condition workaround (#321)

### Maintenance
- [Scripts Audit](scripts-audit.md) - 📋 **LOW PRIORITY** - Inventory of all scripts with usage status

## Archived Items

- [Expo SDK 54 Upgrade](expo-sdk-54-upgrade.md) - ✅ **COMPLETED** - Prisma blocker resolved by migrating to PowerSync; SDK 51 → 55 upgrade completed (PR #405)
- [Native Siren Filtering](native-siren-filtering.md) - ✅ **COMPLETED** - Superseded by native AccessibilityService blocking path


## Priority Levels

- 🔴 **BLOCKED**: External dependency prevents progress
- 🚨 **HIGH**: Critical for production stability or user experience
- ⚠️ **MEDIUM**: Important but not blocking, should be addressed soon
- 📋 **LOW**: Nice to have, address when relevant or when metrics indicate need
- ✅ **COMPLETED**: Addressed and can be archived

## Trigger Points

When to revisit these improvements:
- **Post-Upgrade Cleanup**: Replace `react-native-popup-menu` and `react-native-elements` when working on related screens
- **Metro Package Exports**: Re-evaluate `unstable_enablePackageExports` after firebase/PowerSync updates
- **Navigation Override**: Remove `@react-navigation/native` override after next expo-router version bump
- **Error Handling**: When seeing first error reports from users
- **Migration Strategy**: Before first app update with schema changes
- **Testing**: When reaching 1000 active users
- **Performance**: When operations take >100ms or DB size >10MB

## Review Schedule

This technical debt backlog should be reviewed:
- **Monthly**: Update priorities and mark completed items
- **Quarterly**: Comprehensive review and re-prioritization
- **Before major releases**: Ensure critical items are addressed

## Adding New Items

When adding technical debt:
1. Create a new markdown file in this directory
2. Use the template structure (see existing files)
3. Add to this README with priority indicator
4. Include trigger points for when to address
5. Estimate effort (Low/Medium/High)

## Notes

- This is not an exhaustive list - new items emerge as the project evolves
- Priorities may change based on user feedback and app metrics
- Some items may become irrelevant as the codebase evolves
