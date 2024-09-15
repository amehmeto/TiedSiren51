import { BlockSessionForm } from '../shared/BlockSessionForm.tsx'
import { TabScreens } from '../../../navigators/screen-lists/TabScreens.ts'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '../../../navigators/screen-lists/screenLists.ts'
import { RootState } from '../../../../core/_redux_/createStore.ts'
import { useSelector } from 'react-redux'
import { selectBlockSessionById } from '../../../../core/block-session/selectors/selectBlockSessionById.ts'
import { HomeStackScreens } from '../../../navigators/screen-lists/HomeStackScreens.ts'
import { RouteProp } from '@react-navigation/native'

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
