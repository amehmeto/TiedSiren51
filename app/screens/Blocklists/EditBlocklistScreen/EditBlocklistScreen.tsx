import * as React from 'react'
import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '@/app/navigation/screen-lists/screenLists'
import { TabScreens } from '@/app/navigation/screen-lists/TabScreens'
import { BlocklistsStackScreens } from '@/app/navigation/screen-lists/BlocklistsStackScreens'
import { BlocklistForm } from '@/app/screens/Blocklists/shared/BlocklistForm'

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
