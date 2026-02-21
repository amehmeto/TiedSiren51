import * as React from 'react'
import { useState } from 'react'
import { FlatList, StyleSheet, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { SirenType } from '@/core/siren/sirens'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'

import {
  FormMode,
  selectBlocklistFormViewModel,
} from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { SectionDivider } from '@/ui/screens/Blocklists/SectionDivider'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type TextInputSubmitEvent = {
  nativeEvent: { text: string }
}

type TextInputSelectionSceneProps = {
  readonly onSubmitEditing: (event: TextInputSubmitEvent) => void
  readonly placeholder: string
  readonly sirenType: SirenType.WEBSITES | SirenType.KEYWORDS
  readonly toggleSiren: (sirenType: SirenType, sirenId: string) => void
  readonly isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  readonly mode: FormMode
  readonly blocklistId?: string
}

export function TextInputSelectionScene({
  onSubmitEditing,
  placeholder,
  sirenType,
  toggleSiren,
  isSirenSelected,
  mode,
  blocklistId,
}: TextInputSelectionSceneProps) {
  const [isFocused, setIsFocused] = useState(false)
  const insets = useSafeAreaInsets()

  const viewModel = useSelector((state: RootState) =>
    selectBlocklistFormViewModel(
      state,
      dependencies.dateProvider,
      mode,
      blocklistId,
    ),
  )

  const sortedSirens =
    sirenType === SirenType.WEBSITES
      ? viewModel.sortedWebsites
      : viewModel.sortedKeywords

  const { lockedSirens } = viewModel

  return (
    <>
      <TextInput
        style={[
          styles.addWebsiteInput,
          { borderColor: isFocused ? T.color.lightBlue : T.color.borderSubtle },
        ]}
        placeholder={placeholder}
        placeholderTextColor={T.color.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmitEditing}
      />
      <FlatList
        data={sortedSirens}
        keyExtractor={(sectionEntry) =>
          sectionEntry.type === 'divider' ? sectionEntry.id : sectionEntry.siren
        }
        renderItem={({ item: sectionEntry }) => {
          if (sectionEntry.type === 'divider') return <SectionDivider />

          const isSelected = isSirenSelected(sirenType, sectionEntry.siren)
          const isLocked = isSirenLocked(
            lockedSirens,
            sirenType,
            sectionEntry.siren,
          )
          return (
            <SelectableSirenCard
              sirenType={sirenType}
              siren={sectionEntry.siren}
              onPress={() => toggleSiren(sirenType, sectionEntry.siren)}
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
    padding: T.spacing.smallMedium,
    color: T.color.text,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
    minHeight: T.height.settingsRow,
  },
  list: {
    flex: 1,
  },
})
