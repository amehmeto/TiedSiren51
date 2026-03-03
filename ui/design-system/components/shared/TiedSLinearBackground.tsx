import { BlurTargetView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurTargetContext } from '@/ui/design-system/contexts/BlurTargetContext'
import { T } from '@/ui/design-system/theme'

type TiedSLinearBackgroundProps = Readonly<{ children: React.ReactNode }>

export function TiedSLinearBackground({
  children,
}: TiedSLinearBackgroundProps) {
  const insets = useSafeAreaInsets()
  const blurTargetRef = useRef<View>(null)

  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[T.color.darkBlue, T.color.gradientMid, T.color.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </BlurTargetView>
      <View
        style={[styles.content, { paddingTop: T.spacing.large + insets.top }]}
      >
        <BlurTargetContext.Provider value={blurTargetRef}>
          {children}
        </BlurTargetContext.Provider>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
