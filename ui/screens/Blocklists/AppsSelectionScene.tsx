import * as React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'

import { RootState } from '@/core/_redux_/createStore'
import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'
import { selectLockedSirensForBlocklist } from '@/core/strict-mode/selectors/selectLockedSirensForBlocklist'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type AppsSelectionSceneProps = Readonly<{
  androidApps: AndroidSiren[]
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  blocklistId?: string
}>

export function AppsSelectionScene({
  androidApps,
  toggleAppSiren,
  isSirenSelected,
  blocklistId,
}: AppsSelectionSceneProps) {
  const insets = useSafeAreaInsets()

  const lockedSirens = useSelector((state: RootState) =>
    blocklistId
      ? selectLockedSirensForBlocklist(
          state,
          dependencies.dateProvider,
          blocklistId,
        )
      : undefined,
  )

  return (
    <FlatList
      data={androidApps}
      keyExtractor={(item) => item.packageName}
      renderItem={({ item }) => {
        const isSelected = isSirenSelected(SirenType.ANDROID, item.packageName)
        const isLocked = lockedSirens
          ? isSirenLocked(lockedSirens, SirenType.ANDROID, item.packageName)
          : false
        return (
          <SelectableSirenCard
            sirenType={SirenType.ANDROID}
            siren={item}
            onPress={() => toggleAppSiren(SirenType.ANDROID, item)}
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
