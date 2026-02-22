import React from 'react'
import { StyleSheet, Text, TouchableHighlight } from 'react-native'
import type { CustomCancelButtonPropTypes } from 'react-native-modal-datetime-picker'
import { T } from '@/ui/design-system/theme'

export function IOSCancelButton({
  onPress,
  label,
}: CustomCancelButtonPropTypes) {
  return (
    <TouchableHighlight
      style={styles.button}
      underlayColor={T.color.lightBlueOverlay}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: T.border.radius.extraRounded,
    height: T.height.pickerButton,
    justifyContent: 'center',
    backgroundColor: T.color.darkBlueGray,
  },
  text: {
    padding: T.spacing.smallMedium,
    textAlign: 'center',
    color: T.color.lightBlue,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.semibold,
    fontFamily: T.font.family.semibold,
    backgroundColor: T.color.transparent,
  },
})
