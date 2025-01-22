import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { T } from '@/ui/design-system/theme'
import { Platform, StatusBar, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function TiedSLinearBackground(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const insets = useSafeAreaInsets()

  const statusBarHeight =
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top

  return (
    <LinearGradient
      colors={[T.color.darkBlue, T.color.purple]}
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          paddingTop: T.spacing.large + statusBarHeight,
        },
      ]}
    >
      {props.children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
})
