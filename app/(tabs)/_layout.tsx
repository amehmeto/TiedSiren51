import { Tabs } from 'expo-router'
import React from 'react'
import { TabBarIcon } from '@/app-view/design-system/components/navigation/TabBarIcon'
import { StyleSheet } from 'react-native'
import { T } from '@/app-view/design-system/theme'
import { Entypo } from '@expo/vector-icons'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function TabLayout() {
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="light-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="strict_mode"
        options={{
          title: 'Strict Mode',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="blocklist"
        options={{
          title: 'Blocklist',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="shield" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
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
