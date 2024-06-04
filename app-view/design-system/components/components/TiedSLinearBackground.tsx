import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { T } from '@/app-view/design-system/theme'
import { Platform, StatusBar, StyleSheet } from 'react-native'

export function TiedSLinearBackground(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0

  return (
    <LinearGradient
      colors={[T.color.darkBlue, T.color.purple]}
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { paddingTop: T.spacing.large + statusBarHeight },
      ]}
    >
      {props.children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: T.spacing.large,
  },
})
