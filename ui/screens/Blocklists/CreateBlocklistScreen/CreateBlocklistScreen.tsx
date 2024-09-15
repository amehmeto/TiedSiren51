import * as React from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '@/ui/navigation/screenLists'
import { TabScreens } from '@/ui/navigation/TabScreens'
import { BlocklistForm } from '@/ui/screens/Blocklists/shared/BlocklistForm'

export function CreateBlocklistScreen({
  navigation,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.BLOCKLIST>
}>) {
  return <BlocklistForm mode="create" navigation={navigation} />
}
