import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { T } from '@/ui/design-system/theme'

type TiedSLinearBackgroundProps = Readonly<{ children: React.ReactNode }>

export function TiedSLinearBackground({
  children,
}: TiedSLinearBackgroundProps) {
  const insets = useSafeAreaInsets()

  return (
    <LinearGradient
      colors={[T.color.darkBlue, T.color.gradientMid, T.color.purple]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          paddingTop: T.spacing.large + insets.top,
        },
      ]}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
