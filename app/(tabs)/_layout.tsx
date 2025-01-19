import { Tabs } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Pressable } from 'react-native'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { T } from '@/ui/design-system/theme'
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated'

export default function TabLayout() {
  const tabs = [
    {
      name: 'home',
      title: TabScreens.HOME,
      icon: 'light-up' as const,
      IconType: Entypo,
    },
    {
      name: 'strict-mode/index',
      title: TabScreens.STRICT_MODE,
      icon: 'lock-open-outline' as const,
      IconType: Ionicons,
    },
    {
      name: 'blocklists',
      title: TabScreens.BLOCKLIST,
      icon: 'shield' as const,
      IconType: Entypo,
    },
    {
      name: 'settings/index',
      title: TabScreens.SETTINGS,
      icon: 'settings-outline' as const,
      IconType: Ionicons,
    },
  ]

  const TabBarIcon = ({
    IconType,
    iconName,
    color,
    size,
    isFocused,
  }: {
    IconType: typeof Entypo | typeof Ionicons
    iconName: any
    color: string
    size: number
    isFocused: boolean
  }) => {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      }
    })

    useEffect(() => {
      // Using ternary operator for smoother animation and immediate focus handling
      scale.value = withTiming(isFocused ? 1.2 : 1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
      opacity.value = withTiming(isFocused ? 1 : 0.7, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    }, [isFocused])

    return (
      <Animated.View style={animatedStyle}>
        <IconType name={iconName} size={size} color={color} />
      </Animated.View>
    )
  }

  return (
    <Tabs
      screenOptions={({ route, navigation }) => ({
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: T.color.lightBlue,
        tabBarInactiveTintColor: T.color.inactive,
        headerShown: false,
        headerStyle: { backgroundColor: T.color.darkBlue },
        headerTintColor: T.color.lightBlue,
        headerTitleStyle: { fontWeight: T.font.weight.bold },
        headerShadowVisible: false,
        tabBarIcon: ({ color, size, focused }) => {
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
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={() => {
              // Immediate tab change without delay
              navigation.navigate(route.name)
            }}
          />
        ),
      })}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
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
