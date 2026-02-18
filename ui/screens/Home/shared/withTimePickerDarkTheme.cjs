/**
 * Custom Expo config plugin that fixes the Android time picker text colors
 * for dark mode.
 *
 * The @react-native-community/datetimepicker config plugin only creates a
 * widget style (android:timePickerStyle) for the time picker, but the dialog's
 * text colors (inner clock numbers, header, buttons) come from the dialog
 * theme — not the widget style. Without a dialog theme override, text inherits
 * dark colors from the system default, making it unreadable on our dark
 * background.
 *
 * This plugin creates a TimePickerDialogTheme (following the same pattern the
 * datetimepicker plugin uses for DatePickerDialogTheme) and sets
 * android:textColorPrimary to white so all text in the time picker dialog is
 * readable.
 */
const {
  withAndroidStyles,
  withAndroidColors,
  withAndroidColorsNight,
  AndroidConfig,
} = require('@expo/config-plugins')

const WHITE = '#FFFFFF'
const COLOR_NAME = 'timePickerDialog_textColorPrimary'
const STYLE_NAME = 'TimePickerDialogTheme'
const PARENT_STYLE = 'Theme.AppCompat.Light.Dialog'

const { assignStylesValue, getAppThemeLightNoActionBarGroup } =
  AndroidConfig.Styles
const { assignColorValue } = AndroidConfig.Colors

function withTimePickerDarkTheme(config) {
  // Add color resource (light)
  let newConfig = withAndroidColors(config, (mod) => {
    mod.modResults = assignColorValue(mod.modResults, {
      name: COLOR_NAME,
      value: WHITE,
    })
    return mod
  })

  // Add color resource (night/dark)
  newConfig = withAndroidColorsNight(newConfig, (mod) => {
    mod.modResults = assignColorValue(mod.modResults, {
      name: COLOR_NAME,
      value: WHITE,
    })
    return mod
  })

  // Add dialog theme style and register it on the app theme
  newConfig = withAndroidStyles(newConfig, (mod) => {
    // Create TimePickerDialogTheme with textColorPrimary
    mod.modResults = assignStylesValue(mod.modResults, {
      add: true,
      parent: {
        name: STYLE_NAME,
        parent: PARENT_STYLE,
      },
      name: 'android:textColorPrimary',
      value: `@color/${COLOR_NAME}`,
    })

    // Register the dialog theme on the app theme
    mod.modResults = assignStylesValue(mod.modResults, {
      add: true,
      parent: getAppThemeLightNoActionBarGroup(),
      name: 'android:timePickerDialogTheme',
      value: `@style/${STYLE_NAME}`,
    })

    return mod
  })

  return newConfig
}

module.exports = withTimePickerDarkTheme
