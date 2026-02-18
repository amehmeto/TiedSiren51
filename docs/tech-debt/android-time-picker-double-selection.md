# Android Time Picker Double Selection Workaround

> Created: February 18, 2026
> Status: **DEFERRED**
> Priority: 📋 **LOW** - Workaround in place, cosmetic/UX issue resolved
> Related PR: #321
> Related Issue: #313

## Problem

On Android, the `react-native-modal-datetime-picker` modal blinks and requires double selection when confirming a time. The root cause is a race condition in the library: React batches `setFieldValue` (date change) and `setIsTimePickerVisible(false)` into the same render cycle, causing the library's internal `areEqual` memo to see a changed `date` prop while `isVisible` is still `true`, which re-renders and briefly re-shows the picker.

## Current Workaround

In `SelectTime.tsx`, the confirmed time is stored in a ref and the form field update is deferred until the `onHide` callback fires, using `requestAnimationFrame` to ensure `isVisible=false` is committed before the date prop changes.

This works but adds complexity to the component that ideally belongs in the library itself.

## Ideal Fix

The `areEqual` memo in `DateTimePickerModal.android` should short-circuit when `isVisible` is `false` — if the picker isn't visible, a changed `date` prop shouldn't trigger a re-show. This fix belongs upstream in `react-native-modal-datetime-picker`.

## Action Items

- [ ] Check if an upstream issue already exists in [react-native-modal-datetime-picker](https://github.com/mmazzarolo/react-native-modal-datetime-picker/issues)
- [ ] If not, open an issue describing the race condition
- [ ] Consider submitting a PR to fix the `areEqual` memo in the library
- [ ] Once fixed upstream, remove the `pendingTimeRef` / `onHide` / `requestAnimationFrame` workaround from `SelectTime.tsx`

## Related Files

- `ui/screens/Home/shared/SelectTime.tsx` - Contains the workaround
- `ui/screens/Home/shared/TimePicker.tsx` - Passes `onHide` to `DateTimePickerModal`

## Trigger Points

Consider addressing when:
- Upgrading `react-native-modal-datetime-picker` to a version that fixes this
- Migrating to an alternative time picker library
- Contributing back to the open-source ecosystem
