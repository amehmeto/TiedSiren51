import React from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { BottomTabs } from '@/ui/navigation/BottomTabs'

export default function TabLayout() {
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
    <BottomTabs
    // screenOptions={{
    //   tabBarLabelPosition: 'below-icon',
    //   tabBarStyle: styles.tabBar,
    //   tabBarActiveTintColor: T.color.lightBlue,
    //   tabBarInactiveTintColor: T.color.inactive,
    //   headerShown: false,
    //   headerStyle: { backgroundColor: T.color.darkBlue },
    //   headerTintColor: T.color.lightBlue,
    //   headerTitleStyle: { fontWeight: T.font.weight.bold },
    //   headerShadowVisible: false,
    // }}
    >
      {tabs.map((tab) => (
        <BottomTabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <tab.IconType name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </BottomTabs>
  )
}

// const styles = StyleSheet.create({
//   tabBar: {
//     borderTopWidth: T.border.width.none,
//     backgroundColor: T.color.darkBlue,
//     height: T.tabBarHeight,
//     padding: T.spacing.small,
//   },
// })
