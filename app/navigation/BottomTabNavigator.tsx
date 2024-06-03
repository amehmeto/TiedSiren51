import { SettingsScreen } from '../screens/Settings/SettingScreen/SettingsScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { T } from '../design-system/theme'
import { BlocklistStackNavigator } from './BlocklistStackNavigator'
import { TabScreens } from './screen-lists/TabScreens'
import { HomeStackNavigator } from './HomeStackNavigator'
import { StrictModeScreen } from '../screens/StrictMode/StrictModeScreen/StrictModeScreen'
import { StyleSheet } from 'react-native'
import { ScreenList } from './screen-lists/screenLists'

const Tab = createBottomTabNavigator<ScreenList>()

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
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
      <Tab.Screen
        name={TabScreens.HOME}
        component={HomeStackNavigator}
        // component={CreateBlocklistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="light-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabScreens.STRICT_MODE}
        component={StrictModeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabScreens.BLOCKLIST}
        component={BlocklistStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="shield" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabScreens.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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
