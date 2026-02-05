# Android Time Picker Border Radius Limitation

> Created: February 5, 2026
> Status: **DEFERRED**
> Priority: 📋 **LOW** - Cosmetic inconsistency between platforms

## Problem

The iOS time picker has rounded corners via `modalStyleIOS` and `pickerContainerStyleIOS`, but the Android time picker uses the native Material Design dialog which cannot be customized through the `@react-native-community/datetimepicker` Expo config plugin.

### Current State

**iOS** - Fully styled with design system:
- Rounded corners (`T.border.radius.extraRounded`)
- Dark theme with custom accent colors
- Configured via runtime props in `SelectTime.tsx`

**Android** - Limited to color customization only:
- Background colors configured in `app.config.js`
- No border radius customization available
- Uses system Material Design time picker shape

## Technical Details

The `@react-native-community/datetimepicker` Expo config plugin (v8.2.0+) only exposes these Android time picker properties:

- `background`
- `headerBackground`
- `numbersBackgroundColor`
- `numbersSelectorColor`
- `numbersTextColor`

Border radius/shape customization is **not supported** by the plugin.

## Potential Solutions

### Option 1: Accept Platform Difference (Current)
- iOS gets rounded corners, Android uses standard Material Design
- Minimal effort, follows platform conventions
- **Chosen for now**

### Option 2: Override Android Styles at Native Level
- Modify `android/app/src/main/res/values/styles.xml`
- Add custom `TimePickerDialog` theme with `cornerRadius`
- Requires maintenance during Expo prebuild

### Option 3: Use Alternative Library
- Switch to `react-native-date-picker` which has more customization
- More work to migrate, but consistent cross-platform styling
- May introduce new dependencies and maintenance burden

## Related Files

- `ui/screens/Home/shared/SelectTime.tsx` - Time picker component
- `app.config.js` - Android theming via Expo plugin

## Trigger Points

Consider addressing when:
- Users report the inconsistency as confusing
- Design system audit requires strict cross-platform consistency
- Migrating to a different date/time picker for other reasons

## References

- [datetimepicker android-styling.md](https://github.com/react-native-datetimepicker/datetimepicker/blob/master/docs/android-styling.md)
- PR #261: Time picker redesign implementation
