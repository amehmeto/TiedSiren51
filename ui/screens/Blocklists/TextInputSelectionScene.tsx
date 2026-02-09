import * as React from 'react'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SirenType } from '@/core/siren/sirens'
import { T } from '@/ui/design-system/theme'

import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type ListItem =
  | { type: 'siren'; siren: string }
  | { type: 'divider'; id: string }

type TextInputSelectionSceneProps = Readonly<{
  onSubmitEditing: (event: { nativeEvent: { text: string } }) => void
  placeholder: string
  sirenType: SirenType.WEBSITES | SirenType.KEYWORDS
  data: string[]
  toggleSiren: (sirenType: SirenType, sirenId: string) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  savedSelectedSirens: string[]
}>

export function TextInputSelectionScene({
  onSubmitEditing,
  placeholder,
  sirenType,
  data,
  toggleSiren,
  isSirenSelected,
  savedSelectedSirens,
}: TextInputSelectionSceneProps) {
  const [isFocused, setIsFocused] = useState(false)
  const insets = useSafeAreaInsets()

  const sortedListItems = useMemo(() => {
    const savedSet = new Set(savedSelectedSirens)

    const selectedSirens = data
      .filter((siren) => savedSet.has(siren))
      .sort((a, b) => a.localeCompare(b))

    const unselectedSirens = data
      .filter((siren) => !savedSet.has(siren))
      .sort((a, b) => a.localeCompare(b))

    const items: ListItem[] = []

    selectedSirens.forEach((siren) => items.push({ type: 'siren', siren }))

    if (selectedSirens.length > 0 && unselectedSirens.length > 0)
      items.push({ type: 'divider', id: 'divider-available' })

    unselectedSirens.forEach((siren) => items.push({ type: 'siren', siren }))

    return items
  }, [data, savedSelectedSirens])

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
        keyExtractor={(item) =>
          item.type === 'divider' ? item.id : item.siren
        }
        renderItem={({ item }) => {
          if (item.type === 'divider')
            return <SectionDivider label="Available" />

          const isSelected = isSirenSelected(sirenType, item.siren)
          return (
            <SelectableSirenCard
              sirenType={sirenType}
              siren={item.siren}
              onPress={() => toggleSiren(sirenType, item.siren)}
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
