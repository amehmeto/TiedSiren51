import { Entypo, Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type EntypoTab = {
  name: string
  title: string
  icon: React.ComponentProps<typeof Entypo>['name']
  IconType: typeof Entypo
}

type IoniconsTab = {
  name: string
  title: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  IconType: typeof Ionicons
}

export type Tab = EntypoTab | IoniconsTab

function isEntypoTab(tab: Tab): tab is EntypoTab {
  return tab.IconType === Entypo
}

const FOCUSED_SCALE = 1.1
const DEFAULT_SCALE = 1
const ANIMATION_DURATION = 250

type AnimatedTabBarIconProps = {
  readonly tab: Tab
  readonly color: string
  readonly size: number
  readonly isFocused: boolean
}

export function AnimatedTabBarIcon({
  tab,
  color,
  size,
  isFocused,
}: AnimatedTabBarIconProps) {
  const scale = useSharedValue(DEFAULT_SCALE)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  useEffect(() => {
    const targetScale = isFocused ? FOCUSED_SCALE : DEFAULT_SCALE
    // eslint-disable-next-line react-hooks/immutability -- SharedValue.value is mutable by design in react-native-reanimated
    scale.value = withTiming(targetScale, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.ease),
    })
  }, [isFocused, scale])

  return (
    <Animated.View style={animatedStyle}>
      {isEntypoTab(tab) ? (
        <Entypo name={tab.icon} size={size} color={color} />
      ) : (
        <Ionicons name={tab.icon} size={size} color={color} />
      )}
    </Animated.View>
  )
}
