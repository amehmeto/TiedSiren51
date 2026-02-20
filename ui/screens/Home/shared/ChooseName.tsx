import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'

const NAME_PLACEHOLDER = 'Choose a name...'

type ChooseNameFields = {
  values: BlockSessionFormValues
  onChange: (text: string) => void
  onBlur: () => (e: React.FocusEvent) => void
}

type ChooseNameProps = Readonly<ChooseNameFields>

export function ChooseName({ values, onChange, onBlur }: ChooseNameProps) {
  const [isNameModalVisible, setIsNameModalVisible] = useState<boolean>(false)
  const displayName = values.name ? values.name : NAME_PLACEHOLDER

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>Name</Text>
        <Pressable onPress={() => setIsNameModalVisible(true)}>
          <Text style={styles.option}>{displayName}</Text>
        </Pressable>
      </View>

      <TiedSModal
        isVisible={isNameModalVisible}
        onRequestClose={() => setIsNameModalVisible(false)}
        style={styles.modal}
      >
        <TiedSTextInput
          onChangeText={onChange}
          onBlur={onBlur}
          autoFocus
          selectTextOnFocus
          placeholder={NAME_PLACEHOLDER}
          value={values.name ?? ''}
        />
        <TiedSButton
          text={'SAVE'}
          onPress={() => setIsNameModalVisible(false)}
        />
      </TiedSModal>
    </>
  )
}

const styles = StyleSheet.create({
  param: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: T.spacing.medium,
    paddingBottom: T.spacing.medium,
    paddingLeft: T.spacing.small,
    paddingRight: T.spacing.small,
  },
  label: {
    color: T.color.text,
    fontFamily: T.font.family.medium,
  },
  option: {
    color: T.color.lightBlue,
    fontFamily: T.font.family.primary,
    textAlign: 'right',
  },
  modal: {
    flexDirection: 'column',
    width: T.layout.width.fourFifths,
  },
})
