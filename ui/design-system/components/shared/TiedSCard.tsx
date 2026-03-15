import { BlurView } from 'expo-blur'
import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { useBlurTarget } from './BlurTargetContext'

type TiedSCardOwnProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

type TiedSCardProps = Readonly<TiedSCardOwnProps>

export function TiedSCard({ children, style }: TiedSCardProps) {
  const blurTarget = useBlurTarget()

  return (
    <BlurView
      intensity={T.effects.blur.intensity.modal}
      tint={T.effects.blur.tint.dark}
      blurMethod={T.effects.blur.method.android}
      blurReductionFactor={T.effects.blur.reductionFactor}
      blurTarget={blurTarget}
      style={[styles.container, style]}
    >
      {children}
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: T.color.cardBackground,
    padding: T.spacing.medium,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
    borderRadius: T.border.radius.roundedMedium,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
})
