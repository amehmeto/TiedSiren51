import * as React from 'react'
import { useMemo } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { T } from '@/ui/design-system/theme'
import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type ListItem =
  | { type: 'app'; app: AndroidSiren }
  | { type: 'divider'; id: string }

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

  const sortedListItems = useMemo(() => {
    const savedSet = new Set(savedSelectedPackageNames)

    const selectedApps = androidApps
      .filter((app) => savedSet.has(app.packageName))
      .sort((a, b) => a.appName.localeCompare(b.appName))

    const unselectedApps = androidApps
      .filter((app) => !savedSet.has(app.packageName))
      .sort((a, b) => a.appName.localeCompare(b.appName))

    const items: ListItem[] = []

    selectedApps.forEach((app) => items.push({ type: 'app', app }))

    if (selectedApps.length > 0 && unselectedApps.length > 0)
      items.push({ type: 'divider', id: 'divider-available' })

    unselectedApps.forEach((app) => items.push({ type: 'app', app }))

    return items
  }, [androidApps, savedSelectedPackageNames])

  return (
    <FlatList
      data={sortedListItems}
      keyExtractor={(item) =>
        item.type === 'divider' ? item.id : item.app.packageName
      }
      renderItem={({ item }) => {
        if (item.type === 'divider') return <SectionDivider label="Available" />

        const isSelected = isSirenSelected(
          SirenType.ANDROID,
          item.app.packageName,
        )
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={item.app}
            onPress={() => toggleAppSiren(SirenType.ANDROID, item.app)}
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
