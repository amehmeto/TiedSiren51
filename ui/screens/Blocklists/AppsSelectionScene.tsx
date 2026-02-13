import * as React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { isSirenLocked, LockedSirens } from '@/core/strict-mode/is-siren-locked'
import { T } from '@/ui/design-system/theme'
import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'
import { SortedListItem } from '@/ui/screens/Blocklists/sort-with-selected-first'

type AppsSelectionSceneProps = Readonly<{
  sortedApps: SortedListItem<AndroidSiren>[]
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  lockedSirens: LockedSirens
}>

export function AppsSelectionScene({
  sortedApps,
  toggleAppSiren,
  isSirenSelected,
  lockedSirens,
}: AppsSelectionSceneProps) {
  const insets = useSafeAreaInsets()

  return (
    <FlatList
      data={sortedApps}
      keyExtractor={(item) =>
        item.type === 'divider' ? item.id : item.item.packageName
      }
      renderItem={({ item }) => {
        if (item.type === 'divider')
          return <SectionDivider label={item.label} />

        const isSelected = isSirenSelected(
          SirenType.ANDROID,
          item.item.packageName,
        )
        const isLocked = isSirenLocked(
          lockedSirens,
          SirenType.ANDROID,
          item.item.packageName,
        )
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={item.item}
            onPress={() => toggleAppSiren(SirenType.ANDROID, item.item)}
            isSelected={isSelected}
            isLocked={isLocked}
          />
        )
      }}
      style={styles.list}
      contentContainerStyle={{
        paddingBottom:
          Math.max(insets.bottom, T.scroll.padding.minBottom) +
          T.scroll.padding.additional,
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
