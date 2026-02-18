/**
 * Custom Expo config plugin that fixes the Android time picker text colors
 * for dark mode.
 *
 * The @react-native-community/datetimepicker config plugin hardcodes the
 * parent style as `android:Widget.Material.Light.TimePicker`, which gives
 * dark (black) text on the inner clock numbers and buttons — unreadable
 * on our dark background.
 *
 * This plugin runs AFTER the datetimepicker plugin and changes the parent
 * to the dark variant (`android:Widget.Material.TimePicker`), which uses
 * white text by default.
 */
const { withAndroidStyles } = require('@expo/config-plugins')

function withTimePickerDarkTheme(config) {
  return withAndroidStyles(config, (mod) => {
    const resources = mod.modResults.resources

    if (!resources.style) return mod

    const timePickerStyle = resources.style.find(
      (s) => s.$.name === 'TimePickerTheme',
    )

    if (timePickerStyle)
      timePickerStyle.$.parent = 'android:Widget.Material.TimePicker'

    return mod
  })
}

module.exports = withTimePickerDarkTheme
