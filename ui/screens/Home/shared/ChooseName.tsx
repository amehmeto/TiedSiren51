import { FormikErrors } from 'formik'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'

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
    testID?: string
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
    width: T.layout.width.fourFifths,
  },
})
