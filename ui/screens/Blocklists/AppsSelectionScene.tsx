import * as React from 'react'
import { FlatList } from 'react-native'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type AppsSelectionSceneProps = Readonly<{
  androidApps: AndroidSiren[]
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
}>

export function AppsSelectionScene({
  androidApps,
  toggleAppSiren,
  isSirenSelected,
}: AppsSelectionSceneProps) {
  return (
    <FlatList
      data={androidApps}
      keyExtractor={(item) => item.packageName}
      renderItem={({ item }) => {
        const isSelected = isSirenSelected(SirenType.ANDROID, item.packageName)
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={item}
            onPress={() => toggleAppSiren(SirenType.ANDROID, item)}
            isSelected={isSelected}
          />
        )
      }}
    />
  )
}
