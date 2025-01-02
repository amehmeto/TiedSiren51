import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { T } from '@/ui/design-system/theme'
import { Platform, StatusBar, StyleSheet, SafeAreaView } from 'react-native'

const statusBarHeight =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0

export function TiedSLinearBackground(
  props: Readonly<{ children: React.ReactNode }>,
) {
  return (
    <LinearGradient
      colors={[T.color.darkBlue, T.color.purple]}
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <>{props.children}</>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: statusBarHeight + T.spacing.large,
  },
})
