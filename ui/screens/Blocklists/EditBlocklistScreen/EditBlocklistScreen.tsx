import * as React from 'react'
import { RouteProp } from '@react-navigation/native'
import { ScreenList } from '@/ui/navigation/screenLists'
import { BlocklistsStackScreens } from '@/ui/navigation/BlocklistsStackScreens'
import { BlocklistForm } from '@/ui/screens/Blocklists/shared/BlocklistForm'

export function EditBlocklistScreen({
  // navigation,
  route,
}: Readonly<{
  // navigation: NativeStackNavigationProp<ScreenList, TabScreens.BLOCKLIST>
  route: RouteProp<ScreenList, BlocklistsStackScreens.EDIT_BLOCKLIST>
}>) {
  // if (!route || !navigation) return null

  return (
    <BlocklistForm
      mode="edit"
      // navigation={navigation}
      blocklistId={route?.params.blocklistId}
    />
  )
}
