import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { FormikProps } from 'formik'
import { StyleSheet, Text, Pressable } from 'react-native'
import BlockingConditionModal from '@/ui/design-system/components/shared/BlockingConditionModal'
import { T } from '@/ui/design-system/theme'
import { useState } from 'react'

export function SelectBlockingCondition(props: { form: FormikProps<Session> }) {
  const selectBlockingCondition = (selectedCondition: string) => {
    const currentConditions = props.form.values.blockingConditions || []
    props.form.setFieldValue('blockingConditions', [
      ...currentConditions,
      selectedCondition,
    ])
    props.form.setFieldTouched('blockingCondition', true)
    setIsBlockingConditionModalVisible(false)
  }
  const [isBlockingConditionModalVisible, setIsBlockingConditionModalVisible] =
    useState<boolean>(false)

  return (
    <>
      <Pressable
        style={styles.blockingCondition}
        onPress={() => setIsBlockingConditionModalVisible(true)}
      >
        <Text style={styles.label}>{'Blocking Conditions'}</Text>
        <Text style={styles.option}>
          {props.form.values.blockingConditions.length > 0
            ? props.form.values.blockingConditions.join(', ')
            : 'Select blocking conditions...'}
        </Text>
      </Pressable>

      <BlockingConditionModal
        visible={isBlockingConditionModalVisible}
        onClose={() => setIsBlockingConditionModalVisible(false)}
        onSelectCondition={selectBlockingCondition}
      />
    </>
  )
}

const styles = StyleSheet.create({
  label: {
    color: T.color.text,
  },
  option: {
    color: T.color.lightBlue,
    textAlign: 'right',
  },
  blockingCondition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: T.spacing.medium,
    paddingBottom: T.spacing.medium,
    paddingLeft: T.spacing.small,
    paddingRight: T.spacing.small,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    marginTop: T.spacing.extraSmall,
    fontWeight: T.font.weight.bold,
  },
})
