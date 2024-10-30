import { withLayoutContext } from 'expo-router'
import { createNativeBottomTabNavigator } from 'react-native-bottom-tabs/react-navigation'

export const BottomTabs = withLayoutContext(
  createNativeBottomTabNavigator().Navigator,
)
