import React from 'react'
import { StyleSheet, Text, TouchableHighlight } from 'react-native'
import type { CustomConfirmButtonPropTypes } from 'react-native-modal-datetime-picker'
import { T } from '@/ui/design-system/theme'

export function IOSConfirmButton({
  onPress,
  label,
}: CustomConfirmButtonPropTypes) {
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: T.color.whiteOverlay,
    backgroundColor: T.color.transparent,
    height: T.height.pickerButton,
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    color: T.color.lightBlue,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.normal,
    fontFamily: T.font.family.primary,
    backgroundColor: T.color.transparent,
  },
})
