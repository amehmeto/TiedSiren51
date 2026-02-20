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
  const { message, isDebug } = useSelector(selectToast)

  const fadeAnim = useFadeAnimation({
    isActive: message !== null && !isDebug,
    duration,
    onAnimationComplete: () => dispatch(clearToast()),
  })

  if (!message) return null

  const animatedStyle = isDebug ? undefined : { opacity: fadeAnim }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.message}>{message}</Text>
      {isDebug && (
        <Text onPress={() => dispatch(clearToast())} style={styles.closeText}>
          ✕
        </Text>
      )}
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
    zIndex: T.elevation.overlay,
    elevation: T.elevation.highest,
    flexDirection: 'row',
  },
  message: {
    color: T.color.text,
    fontSize: T.font.size.small,
    flex: 1,
  },
  closeText: {
    color: T.color.text,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    marginLeft: T.spacing.small,
    padding: T.spacing.small,
  },
})
