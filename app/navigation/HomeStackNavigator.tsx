import { HomeStackScreens } from './screen-lists/HomeStackScreens'
import { ScreenList } from './screen-lists/screenLists'
import { T } from '../design-system/theme'
import { EditBlockSessionScreen } from '@/app/screens/Home/EditBlockSessionScreen/EditBlockSessionScreen'
import { CreateBlockSessionScreen } from '@/app/screens/Home/CreateBlockSessionScreen/CreateBlockSessionScreen'
import { HomeScreen } from '@/app/screens/Home/HomeScreen/HomeScreen'

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator<ScreenList>()

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={HomeStackScreens.MAIN_HOME}
      screenOptions={{
        headerStyle: { backgroundColor: T.color.darkBlue },
        headerTintColor: T.color.lightBlue,
        headerTitleStyle: { fontWeight: T.font.weight.bold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name={HomeStackScreens.MAIN_HOME}
        options={{ headerShown: false }}
        component={HomeScreen}
      />
      <Stack.Screen
        name={HomeStackScreens.CREATE_BLOCK_SESSION}
        options={{ headerShown: true }}
        component={CreateBlockSessionScreen}
      />
      <Stack.Screen
        name={HomeStackScreens.EDIT_BLOCK_SESSION}
        options={{ headerShown: true }}
        component={EditBlockSessionScreen}
      />
    </Stack.Navigator>
  )
}
