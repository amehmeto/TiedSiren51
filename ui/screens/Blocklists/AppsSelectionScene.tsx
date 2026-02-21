import * as React from 'react'
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native'
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

type AppsSelectionSceneProps = {
  readonly toggleAppSiren: (
    sirenType: SirenType.ANDROID,
    app: AndroidSiren,
  ) => void
  readonly isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  readonly mode: FormMode
  readonly blocklistId?: string
}

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

  const { sortedAndroidApps, lockedSirens, isLoadingInstalledApps } = viewModel

  const hasNoAppsYet = sortedAndroidApps.length === 0
  const contentContainerStyle =
    isLoadingInstalledApps && hasNoAppsYet
      ? styles.loadingContentContainer
      : {
          paddingBottom:
            Math.max(insets.bottom, T.scroll.padding.minBottom) +
            T.scroll.padding.additional,
        }

  return (
    <FlatList
      data={sortedAndroidApps}
      keyExtractor={(sectionEntry) =>
        sectionEntry.type === 'divider'
          ? sectionEntry.id
          : sectionEntry.siren.packageName
      }
      ListEmptyComponent={
        <ActivityIndicator size="large" color={T.color.lightBlue} />
      }
      renderItem={({ item: sectionEntry }) => {
        if (sectionEntry.type === 'divider') return <SectionDivider />

        const isSelected = isSirenSelected(
          SirenType.ANDROID,
          sectionEntry.siren.packageName,
        )
        const isLocked = isSirenLocked(
          lockedSirens,
          SirenType.ANDROID,
          sectionEntry.siren.packageName,
        )
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={sectionEntry.siren}
            onPress={() =>
              toggleAppSiren(SirenType.ANDROID, sectionEntry.siren)
            }
            isSelected={isSelected}
            isLocked={isLocked}
          />
        )
      }}
      style={styles.list}
      contentContainerStyle={contentContainerStyle}
      overScrollMode="never"
      bounces={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  loadingContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
