import * as React from 'react'
import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BlocklistForm } from '@/app-view/screens/Blocklists/shared/BlocklistForm'
import { ScreenList } from '@/app-view/screen-lists/screenLists'
import { TabScreens } from '@/app-view/screen-lists/TabScreens'
import { BlocklistsStackScreens } from '@/app-view/screen-lists/BlocklistsStackScreens'

export function EditBlocklistScreen({
  navigation,
  route,
}: Readonly<{
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.BLOCKLIST>
  route: RouteProp<ScreenList, BlocklistsStackScreens.EDIT_BLOCKLIST>
}>) {
  if (!route || !navigation) return null
  return (
    <BlocklistForm
      mode="edit"
      navigation={navigation}
      blocklistId={route?.params.blocklistId}
    />
  )
}
