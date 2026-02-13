import { Entypo, Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { Pressable, PressableProps, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { AnimatedTabBarIcon, Tab } from '@/ui/navigation/AnimatedTabBarIcon'
import { TabScreens } from '@/ui/navigation/TabScreens'

type TabBarButtonProps = {
  route: { name: string }
  navigation: { navigate: (name: string) => void }
}

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

export default function TabLayout() {
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )

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
        tabBarIcon: ({ color, size, focused: isFocused }) => {
          const tab = tabs.find((t) => t.name === route.name)
          if (!tab) return null

          const resolvedTab: Tab =
            tab.name === 'strict-mode/index'
              ? {
                  name: tab.name,
                  title: tab.title,
                  icon: isStrictModeActive
                    ? 'lock-closed-outline'
                    : 'lock-open-outline',
                  IconType: Ionicons,
                }
              : tab

          return (
            <AnimatedTabBarIcon
              tab={resolvedTab}
              color={color}
              size={size}
              isFocused={isFocused}
            />
          )
        },
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
