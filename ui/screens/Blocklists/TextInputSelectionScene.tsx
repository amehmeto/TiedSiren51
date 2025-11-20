import * as React from 'react'
import { useState } from 'react'
import { FlatList, StyleSheet, TextInput } from 'react-native'
import { SirenType } from '@/core/siren/sirens'
import { T } from '@/ui/design-system/theme'

import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

export function TextInputSelectionScene(
  props: Readonly<{
    onSubmitEditing: (event: { nativeEvent: { text: string } }) => void
    placeholder: string
    sirenType: SirenType.WEBSITES | SirenType.KEYWORDS
    data: string[]
    toggleSiren: (sirenType: SirenType, sirenId: string) => void
    isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  }>,
) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <>
      <TextInput
        style={[
          styles.addWebsiteInput,
          { borderColor: isFocused ? T.color.lightBlue : T.color.white },
        ]}
        placeholder={props.placeholder}
        placeholderTextColor={T.color.white}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={props.onSubmitEditing}
      />
      <FlatList
        data={props.data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <SelectableSirenCard
            sirenType={props.sirenType}
            siren={item}
            onPress={() => props.toggleSiren(props.sirenType, item)}
            isSelected={props.isSirenSelected(props.sirenType, item)}
          />
        )}
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
})
