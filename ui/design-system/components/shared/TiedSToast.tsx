import { useEffect, useMemo, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectToast } from '@/core/toast/selectors/selectToast'
import { hideToast } from '@/core/toast/toast.slice'
import { T } from '@/ui/design-system/theme'

type TiedSToastProps = Readonly<{
  duration?: number
}>

export function TiedSToast({ duration = 2000 }: TiedSToastProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { message, isVisible } = useSelector(selectToast)
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
      dispatch(hideToast())
    })

    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [isVisible, fadeAnim, duration, dispatch])

  if (!isVisible) return null

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: T.spacing.xxx_large * 2,
    left: T.spacing.medium,
    right: T.spacing.medium,
    backgroundColor: T.color.darkBlueGray,
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
    borderRadius: T.border.radius.roundedMedium,
    alignItems: 'center',
    zIndex: 9999,
    elevation: T.elevation.highest,
  },
  message: {
    color: T.color.text,
    fontSize: T.font.size.small,
    textAlign: 'center',
  },
})
