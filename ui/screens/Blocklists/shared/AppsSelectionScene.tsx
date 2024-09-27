import * as React from 'react'
import { FlatList } from 'react-native'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

export function AppsSelectionScene(props: {
  data: AndroidSiren[]
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
}) {
  return (
    <FlatList
      data={props.data}
      keyExtractor={(item) => item.packageName}
      renderItem={({ item }) => (
        <SelectableSirenCard
          sirenType={SirenType.ANDROID}
          siren={item}
          onPress={() => props.toggleAppSiren(SirenType.ANDROID, item)}
          isSelected={props.isSirenSelected(
            SirenType.ANDROID,
            item.packageName,
          )}
        />
      )}
    />
  )
}
