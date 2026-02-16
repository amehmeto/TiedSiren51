import { BlurView } from 'expo-blur'
import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSCardOwnProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

type TiedSCardProps = Readonly<TiedSCardOwnProps>

export function TiedSCard({ children, style }: TiedSCardProps) {
  return (
    <BlurView
      intensity={T.effects.blur.intensity.strong}
      style={[styles.container, style]}
      tint={'dark'}
    >
      {children}
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
