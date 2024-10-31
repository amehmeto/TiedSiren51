import React from 'react'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { BottomTabs } from '@/ui/navigation/BottomTabs'
import { SafeAreaView } from 'react-native-safe-area-context'
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
// import { Platform } from 'react-native'

// const homeIcon = Icon.getImageSourceSync('home', 24)
// const strictModeIcon = Icon.getImageSourceSync('lock-open', 24)
// const blocklistIcon = Icon.getImageSourceSync('shield', 24)
// const settingsIcon = Icon.getImageSourceSync('cog', 24)

export default function TabLayout() {
  const tabs = [
    {
      name: 'home',
      title: TabScreens.HOME,
      icon: 'house',
    },
    {
      name: 'strict-mode/index',
      title: TabScreens.STRICT_MODE,
      icon: 'lock.open',
    },
    {
      name: 'blocklists',
      title: TabScreens.BLOCKLIST,
      icon: 'shield',
    },
    {
      name: 'settings/index',
      title: TabScreens.SETTINGS,
      icon: 'gearshape',
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BottomTabs>
        {tabs.map((tab) => (
          <BottomTabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: () => ({ sfSymbol: tab.icon }),
              // tabBarIcon: () => {
              //   if (Platform.OS === 'android') {
              //     return homeIcon
              //   }
              //   return { sfSymbol: tab.icon }
              // },
            }}
          />
        ))}
      </BottomTabs>
    </SafeAreaView>
  )
}
