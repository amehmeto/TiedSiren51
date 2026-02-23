import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSCardOwnProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

type TiedSCardProps = Readonly<TiedSCardOwnProps>

export function TiedSCard({ children, style }: TiedSCardProps) {
  return (
    <BlurView
      blurReductionFactor={Platform.OS === 'android' ? 4 : undefined}
      experimentalBlurMethod={
        Platform.OS === 'android' ? 'dimezisBlurView' : undefined
      }
      intensity={T.effects.blur.intensity.modal}
      style={[styles.container, style]}
      tint="systemMaterialDark"
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
    borderRadius: T.border.radius.roundedMedium,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
})
