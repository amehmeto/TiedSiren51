import * as React from 'react'
import { useState } from 'react'
import { FlatList, StyleSheet, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SirenType } from '@/core/siren/sirens'
import { T } from '@/ui/design-system/theme'

import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

type TextInputSelectionSceneProps = Readonly<{
  onSubmitEditing: (event: { nativeEvent: { text: string } }) => void
  placeholder: string
  sirenType: SirenType.WEBSITES | SirenType.KEYWORDS
  data: string[]
  toggleSiren: (sirenType: SirenType, sirenId: string) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
}>

export function TextInputSelectionScene({
  onSubmitEditing,
  placeholder,
  sirenType,
  data,
  toggleSiren,
  isSirenSelected,
}: TextInputSelectionSceneProps) {
  const [isFocused, setIsFocused] = useState(false)
  const insets = useSafeAreaInsets()

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
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isSelected = isSirenSelected(sirenType, item)
          return (
            <SelectableSirenCard
              sirenType={sirenType}
              siren={item}
              onPress={() => toggleSiren(sirenType, item)}
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
