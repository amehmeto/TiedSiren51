import * as React from 'react'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { SirenType } from '@/core/siren/sirens'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'
import { selectLockedSirensForBlocklist } from '@/core/strict-mode/selectors/selectLockedSirensForBlocklist'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'

import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'
import {
  SortedListItem,
  sortWithSelectedFirst,
} from '@/ui/screens/Blocklists/sort-with-selected-first'

type TextInputSelectionSceneProps = Readonly<{
  onSubmitEditing: (event: { nativeEvent: { text: string } }) => void
  placeholder: string
  sirenType: SirenType.WEBSITES | SirenType.KEYWORDS
  data: string[]
  toggleSiren: (sirenType: SirenType, sirenId: string) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  savedSelectedSirens: string[]
  blocklistId?: string
}>

const identity = (s: string) => s

export function TextInputSelectionScene({
  onSubmitEditing,
  placeholder,
  sirenType,
  data,
  toggleSiren,
  isSirenSelected,
  savedSelectedSirens,
  blocklistId,
}: TextInputSelectionSceneProps) {
  const [isFocused, setIsFocused] = useState(false)
  const insets = useSafeAreaInsets()

  const sortedListItems: SortedListItem<string>[] = useMemo(
    () => sortWithSelectedFirst(data, savedSelectedSirens, identity, identity),
    [data, savedSelectedSirens],
  )

  const lockedSirens = useSelector((state: RootState) =>
    selectLockedSirensForBlocklist(
      state,
      dependencies.dateProvider,
      blocklistId,
    ),
  )

  return (
    <>
      <TextInput
        style={[
          styles.addWebsiteInput,
          { borderColor: isFocused ? T.color.lightBlue : T.color.white },
        ]}
        placeholder={placeholder}
        placeholderTextColor={T.color.white}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmitEditing}
      />
      <FlatList
        data={sortedListItems}
        keyExtractor={(item) => (item.type === 'divider' ? item.id : item.item)}
        renderItem={({ item }) => {
          if (item.type === 'divider')
            return <SectionDivider label={item.label} />

          const isSelected = isSirenSelected(sirenType, item.item)
          const isLocked = isSirenLocked(lockedSirens, sirenType, item.item)
          return (
            <SelectableSirenCard
              sirenType={sirenType}
              siren={item.item}
              onPress={() => toggleSiren(sirenType, item.item)}
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
    </>
  )
}

const styles = StyleSheet.create({
  addWebsiteInput: {
    borderBottomWidth: T.border.width.medium,
    padding: T.spacing.small,
    color: T.color.white,
  },
  list: {
    flex: 1,
  },
})
