import * as React from 'react'
import { useMemo } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { T } from '@/ui/design-system/theme'
import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'
import {
  SortedListItem,
  sortWithSelectedFirst,
} from '@/ui/screens/Blocklists/sort-with-selected-first'

type AppsSelectionSceneProps = Readonly<{
  androidApps: AndroidSiren[]
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  savedSelectedPackageNames: string[]
}>

export function AppsSelectionScene({
  androidApps,
  toggleAppSiren,
  isSirenSelected,
  savedSelectedPackageNames,
}: AppsSelectionSceneProps) {
  const insets = useSafeAreaInsets()

  const sortedListItems: SortedListItem<AndroidSiren>[] = useMemo(
    () =>
      sortWithSelectedFirst(
        androidApps,
        savedSelectedPackageNames,
        (app) => app.packageName,
        (app) => app.appName,
      ),
    [androidApps, savedSelectedPackageNames],
  )

  return (
    <FlatList
      data={sortedListItems}
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
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={item.item}
            onPress={() => toggleAppSiren(SirenType.ANDROID, item.item)}
            isSelected={isSelected}
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
