import { useEffect, useMemo } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSToastProps = Readonly<{
  message: string
  isVisible: boolean
  onHide: () => void
  duration?: number
}>

export function TiedSToast({
  message,
  isVisible,
  onHide,
  duration = 2000,
}: TiedSToastProps) {
  const fadeAnim = useMemo(() => new Animated.Value(0), [])

  useEffect(() => {
    if (isVisible) {
      Animated.sequence([
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
      ]).start(() => onHide())
    }
  }, [isVisible, fadeAnim, duration, onHide])

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
