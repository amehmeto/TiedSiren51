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

type AnimatedTabBarIconProps = Readonly<{
  tab: Tab
  color: string
  size: number
  isFocused: boolean
}>

export function AnimatedTabBarIcon({
  tab,
  color,
  size,
  isFocused,
}: AnimatedTabBarIconProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- SharedValue.value is mutable by design in react-native-reanimated
    scale.value = withTiming(isFocused ? 1.2 : 1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
    // eslint-disable-next-line react-hooks/immutability -- SharedValue.value is mutable by design in react-native-reanimated
    opacity.value = withTiming(isFocused ? 1 : 0.7, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
  }, [isFocused, opacity, scale])

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
