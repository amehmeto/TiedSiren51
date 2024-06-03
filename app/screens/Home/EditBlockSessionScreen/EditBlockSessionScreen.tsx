import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootState } from '@/core/_redux_/createStore'
import { useSelector } from 'react-redux'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { RouteProp } from '@react-navigation/native'
import { ScreenList } from '@/app/navigation/screen-lists/screenLists'
import { TabScreens } from '@/app/navigation/screen-lists/TabScreens'
import { HomeStackScreens } from '@/app/navigation/screen-lists/HomeStackScreens'
import { BlockSessionForm } from '@/app/screens/Home/shared/BlockSessionForm'

export function EditBlockSessionScreen({
  navigation,
  route,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.HOME>
  route: RouteProp<ScreenList, HomeStackScreens.EDIT_BLOCK_SESSION>
}>) {
  const sessionId = route.params.sessionId
  const session = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId, state),
  )
  return (
    <BlockSessionForm navigation={navigation} session={session} mode={'edit'} />
  )
}
