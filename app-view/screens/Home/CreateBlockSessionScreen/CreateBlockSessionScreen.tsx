import { BlockSessionForm } from '../shared/BlockSessionForm'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '@/app-view/screen-lists/screenLists'
import { TabScreens } from '@/app-view/screen-lists/TabScreens'

export function CreateBlockSessionScreen({
  navigation,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.HOME>
}>) {
  return <BlockSessionForm navigation={navigation} mode={'create'} />
}
