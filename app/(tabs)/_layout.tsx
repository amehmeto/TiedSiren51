import { Tabs } from 'expo-router'
import React from 'react'
import { T } from '@/ui/design-system/theme'
import { StyleSheet } from 'react-native'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { Entypo, Ionicons } from '@expo/vector-icons'

/*type IconName =
  | 'home'
  | 'lock-open'
  | 'shield'
  | 'settings'
  | 'light-up'
  | 'lock-open-outline'
  | 'settings-outline'*/

export default function TabLayout() {
  // const colorScheme = useColorScheme()

  const tabs: {
    name: string
    title: string
    icon: any
    IconType: typeof Entypo | typeof Ionicons
  }[] = [
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

  return (
    <Tabs
      screenOptions={{
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: T.color.lightBlue,
        tabBarInactiveTintColor: T.color.inactive,
        headerShown: false,
        headerStyle: { backgroundColor: T.color.darkBlue },
        headerTintColor: T.color.lightBlue,
        headerTitleStyle: { fontWeight: T.font.weight.bold },
        headerShadowVisible: false,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <tab.IconType name={tab.icon} size={size} color={color} />
            ),
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
    height: T.tabBarHeight,
    padding: T.spacing.small,
  },
})