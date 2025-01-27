import { Tabs } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Pressable, PressableProps } from 'react-native'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { T } from '@/ui/design-system/theme'
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated'

type Tab = {
  name: string
  title: string
  icon: string
  IconType: typeof Entypo | typeof Ionicons
}

type TabBarIconProps = {
  IconType: typeof Entypo | typeof Ionicons
  iconName: any
  color: string
  size: number
  isFocused: boolean
}

type TabBarButtonProps = {
  route: { name: string }
  navigation: { navigate: (name: string) => void }
}

export default function TabLayout() {
  const tabs: Tab[] = [
    {
      name: 'home',
      title: TabScreens.HOME,
      icon: 'light-up',
      IconType: Entypo,
    },
    {
      name: 'strict-mode/index',
      title: TabScreens.STRICT_MODE,
      icon: 'lock-open-outline',
      IconType: Ionicons,
    },
    {
      name: 'blocklists',
      title: TabScreens.BLOCKLIST,
      icon: 'shield',
      IconType: Entypo,
    },
    {
      name: 'settings/index',
      title: TabScreens.SETTINGS,
      icon: 'settings-outline',
      IconType: Ionicons,
    },
  ]

  const TabBarIcon = ({
    IconType,
    iconName,
    color,
    size,
    isFocused,
  }: TabBarIconProps) => {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }))

    useEffect(() => {
      scale.value = withTiming(isFocused ? 1.2 : 1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
      opacity.value = withTiming(isFocused ? 1 : 0.7, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    }, [isFocused, opacity, scale])

    return (
      <Animated.View style={animatedStyle}>
        <IconType name={iconName} size={size} color={color} />
      </Animated.View>
    )
  }

  const handleTabBarIcon = ({
    route,
    color,
    size,
    focused,
  }: {
    route: { name: string }
    color: string
    size: number
    focused: boolean
  }) => {
    const tab = tabs.find((t) => t.name === route.name)
    if (!tab) return null

    return (
      <TabBarIcon
        IconType={tab.IconType}
        iconName={tab.icon}
        color={color}
        size={size}
        isFocused={focused}
      />
    )
  }

  const handleTabBarButton = (
    props: PressableProps,
    { route, navigation }: TabBarButtonProps,
  ) => (
    <Pressable
      {...props}
      onPress={() => {
        navigation.navigate(route.name)
      }}
    />
  )

  return (
    <Tabs
      screenOptions={({ route, navigation }) => ({
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: T.color.lightBlue,
        tabBarInactiveTintColor: T.color.inactive,
        headerShown: false,
        tabBarIcon: (props) => handleTabBarIcon({ ...props, route }),
        tabBarButton: (props) =>
          handleTabBarButton(props, { route, navigation }),
      })}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: T.border.width.none,
    backgroundColor: T.color.darkBlue,
    padding: T.spacing.small,
  },
})
