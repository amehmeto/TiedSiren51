import { useState, useMemo } from 'react'
import { Animated } from 'react-native'

export function usePressScale() {
  const [scaleAnim] = useState(() => new Animated.Value(1))

  const handlers = useMemo(
    () => ({
      onPressIn: () =>
        Animated.timing(scaleAnim, {
          toValue: 0.97,
          duration: 100,
          useNativeDriver: true,
        }).start(),
      onPressOut: () =>
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start(),
    }),
    [scaleAnim],
  )

  const scaleStyle = useMemo(
    () => ({ transform: [{ scale: scaleAnim }] }),
    [scaleAnim],
  )

  return { scaleStyle, handlers }
}
