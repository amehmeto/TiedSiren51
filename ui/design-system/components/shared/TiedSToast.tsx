import { Animated, StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectToast } from '@/core/toast/selectors/selectToast'
import { clearToast } from '@/core/toast/toast.slice'
import { T } from '@/ui/design-system/theme'
import { useFadeAnimation } from '@/ui/hooks/useFadeAnimation'

type TiedSToastProps = Readonly<{
  duration?: number
}>

export function TiedSToast({ duration = 2000 }: TiedSToastProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { message } = useSelector(selectToast)

  const fadeAnim = useFadeAnimation({
    isActive: message !== null,
    duration,
    onAnimationComplete: () => dispatch(clearToast()),
  })

  if (!message) return null

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
    backgroundColor: T.color.surfaceElevated,
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
    borderRadius: T.border.radius.roundedMedium,
    alignItems: 'center',
    zIndex: T.elevation.overlay,
    elevation: T.elevation.highest,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
    shadowColor: T.shadow.color,
    shadowOffset: T.shadow.offsets.medium,
    shadowOpacity: T.shadow.opacity,
    shadowRadius: T.shadow.radius.medium,
  },
  message: {
    color: T.color.text,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.medium,
    textAlign: 'center',
  },
})
