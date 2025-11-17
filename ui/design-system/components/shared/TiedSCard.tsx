import { BlurView } from 'expo-blur'
import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function TiedSCard(
  props: Readonly<{
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
  }>,
) {
  return (
    <BlurView
      intensity={90}
      style={[styles.container, props.style]}
      tint={'dark'}
    >
      {props.children}
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: T.spacing.medium,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
    borderRadius: T.border.radius.roundedSmall,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
})
