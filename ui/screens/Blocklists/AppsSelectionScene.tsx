import * as React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const insets = useSafeAreaInsets()

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
      style={styles.list}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 40) + 20,
      }}
      overScrollMode="never"
      bounces={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
})
