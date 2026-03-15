import { BlurTargetView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useRef } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { T } from '@/ui/design-system/theme'
import { BlurTargetContext } from './BlurTargetContext'

type TiedSLinearBackgroundProps = Readonly<{ children: React.ReactNode }>

const gradientColors = [
  T.color.darkBlue,
  T.color.gradientMid,
  T.color.purple,
] as const

const gradientStart = { x: 0, y: 0 }
const gradientEnd = { x: 1, y: 1 }

export function TiedSLinearBackground({
  children,
}: TiedSLinearBackgroundProps) {
  const insets = useSafeAreaInsets()
  const ref = useRef<View>(null)
  const paddingTop = T.spacing.large + insets.top

  if (Platform.OS !== 'android') {
    return (
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={[styles.container, { paddingTop }]}
      >
        {children}
      </LinearGradient>
    )
  }

  return (
    <BlurTargetContext.Provider value={ref}>
      <View style={styles.container}>
        <BlurTargetView ref={ref} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={gradientColors}
            start={gradientStart}
            end={gradientEnd}
            style={styles.container}
          />
        </BlurTargetView>
        <View style={[styles.container, { paddingTop }]}>{children}</View>
      </View>
    </BlurTargetContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
