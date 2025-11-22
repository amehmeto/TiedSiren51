import { Entypo, Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React, { useEffect } from 'react'
import { Pressable, PressableProps, StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { T } from '@/ui/design-system/theme'
import { TabScreens } from '@/ui/navigation/TabScreens'

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

type Tab = EntypoTab | IoniconsTab

function isEntypoTab(tab: Tab): tab is EntypoTab {
  return tab.IconType === Entypo
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
    tab,
    color,
    size,
    isFocused,
  }: {
    tab: Tab
    color: string
    size: number
    isFocused: boolean
  }) => {
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
        {isEntypoTab(tab) ? (
          <Entypo name={tab.icon} size={size} color={color} />
        ) : (
          <Ionicons name={tab.icon} size={size} color={color} />
        )}
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
      <TabBarIcon tab={tab} color={color} size={size} isFocused={focused} />
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
      sceneContainerStyle={{ backgroundColor: T.color.transparent }}
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
