import { useEffect, useMemo, useRef } from 'react'
import { Animated } from 'react-native'

type UseFadeAnimationOptions = {
  isVisible: boolean
  duration: number
  onAnimationComplete: () => void
}

export function useFadeAnimation({
  isVisible,
  duration,
  onAnimationComplete,
}: UseFadeAnimationOptions) {
  const fadeAnim = useMemo(() => new Animated.Value(0), [])
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (!isVisible) return

    // Stop any running animation and reset
    if (animationRef.current) animationRef.current.stop()

    fadeAnim.setValue(0)

    animationRef.current = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ])

    animationRef.current.start(() => {
      animationRef.current = null
      onAnimationComplete()
    })

    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [isVisible, fadeAnim, duration, onAnimationComplete])

  return fadeAnim
}
