import { Session } from './BlockSessionForm.tsx'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { TiedSModal } from '../../../design-system/components/TiedSModal.tsx'
import { TiedSButton } from '../../../design-system/components/TiedSButton.tsx'
import { T } from '../../../design-system/theme.ts'
import { TiedSTextInput } from '../../../design-system/components/TiedSTextInput.tsx'
import { FormikErrors } from 'formik'

export function ChooseName(
  props: Readonly<{
    values: Session
    onChange: (text: string) => void
    onBlur: () => (e: React.FocusEvent) => void
    setFieldValue: (
      field: string,
      value: string,
      shouldValidate?: boolean,
    ) => Promise<void | FormikErrors<Session>>
  }>,
) {
  const [isNameModalVisible, setIsNameModalVisible] = useState<boolean>(false)
  const blockSessionName = props.values.name ?? 'Choose a name...'

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>Name</Text>
        <Pressable onPress={() => setIsNameModalVisible(true)}>
          <Text style={styles.option}>{blockSessionName}</Text>
        </Pressable>
      </View>

      <TiedSModal
        isVisible={isNameModalVisible}
        onRequestClose={() => setIsNameModalVisible(false)}
        style={styles.modal}
      >
        <TiedSTextInput
          onChangeText={props.onChange}
          onBlur={props.onBlur}
          selectTextOnFocus={true}
          value={blockSessionName}
        />
        <TiedSButton
          text={'SAVE'}
          onPress={() => {
            props.setFieldValue('name', blockSessionName)
            setIsNameModalVisible(false)
          }}
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
  },
  option: {
    color: T.color.lightBlue,
    textAlign: 'right',
  },
  modal: {
    flexDirection: 'column',
    width: '80%',
  },
})
