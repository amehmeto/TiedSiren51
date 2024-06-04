import { Session } from './BlockSessionForm'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { T } from '@/app-view/design-system/theme'
import { FormikErrors } from 'formik'
import { TiedSModal } from '@/app-view/design-system/components/components/TiedSModal'
import { TiedSTextInput } from '@/app-view/design-system/components/components/TiedSTextInput'
import { TiedSButton } from '@/app-view/design-system/components/components/TiedSButton'

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
