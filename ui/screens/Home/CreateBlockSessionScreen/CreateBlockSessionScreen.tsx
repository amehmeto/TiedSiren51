import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '@/ui/navigation/screenLists'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { BlockSessionForm } from '@/ui/screens/Home/shared/BlockSessionForm'

export function CreateBlockSessionScreen({
  navigation,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.HOME>
}>) {
  return <BlockSessionForm navigation={navigation} mode={'create'} />
}
