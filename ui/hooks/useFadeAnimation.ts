import { useEffect, useMemo, useRef } from 'react'
import { Animated } from 'react-native'

type UseFadeAnimationOptions = {
  isActive: boolean
  duration: number
  onAnimationComplete: () => void
}

export function useFadeAnimation({
  isActive,
  duration,
  onAnimationComplete,
}: UseFadeAnimationOptions) {
  const fadeAnim = useMemo(() => new Animated.Value(0), [])
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)
  const onCompleteRef = useRef(onAnimationComplete)

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete
  }, [onAnimationComplete])

  useEffect(() => {
    if (!isActive) return

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
      onCompleteRef.current()
    })

    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [isActive, fadeAnim, duration])

  return fadeAnim
}
