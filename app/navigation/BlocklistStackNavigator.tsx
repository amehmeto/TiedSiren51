import { BlocklistsStackScreens } from './screen-lists/BlocklistsStackScreens'
import { ScreenList } from '@/app/navigation/screen-lists/screenLists'
import { EditBlocklistScreen } from '@/app/screens/Blocklists/EditBlocklistScreen/EditBlocklistScreen'
import { CreateBlocklistScreen } from '@/app/screens/Blocklists/CreateBlocklistScreen/CreateBlocklistScreen'
import { BlocklistScreen } from '@/app/screens/Blocklists/BlocklistScreen/BlocklistScreen'
import { T } from '@/app/design-system/theme'

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator<ScreenList>()

export function BlocklistStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={BlocklistsStackScreens.MAIN_BLOCKLIST}
      screenOptions={{
        headerStyle: { backgroundColor: T.color.darkBlue },
        headerTintColor: T.color.lightBlue,
        headerTitleStyle: { fontWeight: T.font.weight.bold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name={BlocklistsStackScreens.MAIN_BLOCKLIST}
        component={BlocklistScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={BlocklistsStackScreens.EDIT_BLOCKLIST}
        options={{ headerShown: true }}
        component={EditBlocklistScreen}
      />
      <Stack.Screen
        name={BlocklistsStackScreens.CREATE_BLOCK_LIST}
        options={{ headerShown: true }}
        component={CreateBlocklistScreen}
      />
    </Stack.Navigator>
  )
}
