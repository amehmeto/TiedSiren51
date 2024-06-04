import * as React from 'react'
import { BlocklistForm } from '../shared/BlocklistForm'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '@/app-view/screen-lists/screenLists'
import { TabScreens } from '@/app-view/screen-lists/TabScreens'

export function CreateBlocklistScreen({
  navigation,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.BLOCKLIST>
}>) {
  return <BlocklistForm mode="create" navigation={navigation} />
}
