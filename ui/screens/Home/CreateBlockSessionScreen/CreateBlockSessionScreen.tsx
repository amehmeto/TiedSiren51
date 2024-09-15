import { BlockSessionForm } from '../shared/BlockSessionForm.tsx'
import { TabScreens } from '../../../navigators/screen-lists/TabScreens.ts'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '../../../navigators/screen-lists/screenLists.ts'

export function CreateBlockSessionScreen({
  navigation,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.HOME>
}>) {
  return <BlockSessionForm navigation={navigation} mode={'create'} />
}
