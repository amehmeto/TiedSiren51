import React from 'react'
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function TiedSErrorText(
  props: Readonly<{
    message: string
    style?: StyleProp<TextStyle>
  }>,
) {
  return (
    <Text
      style={[styles.errorText, props.style]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      {props.message}
    </Text>
  )
}

const styles = StyleSheet.create({
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.regular,
    marginBottom: T.spacing.large,
  },
})
