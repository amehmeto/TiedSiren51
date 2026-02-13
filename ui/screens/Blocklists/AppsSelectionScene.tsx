import * as React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'

import { RootState } from '@/core/_redux_/createStore'
import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import {
  FormMode,
  selectBlocklistFormViewModel,
} from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type AppsSelectionSceneProps = Readonly<{
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  mode: FormMode
  blocklistId?: string
}>

export function AppsSelectionScene({
  toggleAppSiren,
  isSirenSelected,
  mode,
  blocklistId,
}: AppsSelectionSceneProps) {
  const insets = useSafeAreaInsets()

  const viewModel = useSelector((state: RootState) =>
    selectBlocklistFormViewModel(
      state,
      dependencies.dateProvider,
      mode,
      blocklistId,
    ),
  )

  const { sortedAndroidApps, lockedSirens } = viewModel

  return (
    <FlatList
      data={sortedAndroidApps}
      keyExtractor={(listItem) =>
        listItem.type === 'divider' ? listItem.id : listItem.siren.packageName
      }
      renderItem={({ item: listItem }) => {
        if (listItem.type === 'divider')
          return <SectionDivider label={listItem.label} />

        const isSelected = isSirenSelected(
          SirenType.ANDROID,
          listItem.siren.packageName,
        )
        const isLocked = isSirenLocked(
          lockedSirens,
          SirenType.ANDROID,
          listItem.siren.packageName,
        )
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={listItem.siren}
            onPress={() => toggleAppSiren(SirenType.ANDROID, listItem.siren)}
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
