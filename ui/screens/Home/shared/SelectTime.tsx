import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { dependencies } from '@/ui/dependencies'
import { TiedSTimePickerModal } from '@/ui/design-system/components/shared/TiedSTimePickerModal'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'

type SelectTimeProps = Readonly<{
  timeField?: 'startedAt' | 'endedAt'
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
  values: BlockSessionFormValues
  isTimePickerVisible?: boolean
  setFieldValue: (field: string, value: string) => void
}>

export function SelectTime({
  timeField = 'startedAt',
  setIsTimePickerVisible,
  values,
  isTimePickerVisible = false,
  setFieldValue,
}: SelectTimeProps) {
  const { dateProvider } = dependencies
  const localeNow = dateProvider.getHHmmNow()

  const chosenTime =
    timeField === 'startedAt'
      ? (values.startedAt ?? localeNow)
      : (values.endedAt ?? localeNow)

  const placeholder =
    timeField === 'startedAt'
      ? (values.startedAt ?? `Select start time...`)
      : (values.endedAt ?? `Select end time...`)

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>
          {timeField === 'startedAt' ? 'Start Time' : 'End Time'}
        </Text>
        <Pressable onPress={() => setIsTimePickerVisible(true)}>
          <Text style={styles.option}>{placeholder}</Text>
        </Pressable>
      </View>
      <TiedSTimePickerModal
        visible={isTimePickerVisible}
        onClose={() => setIsTimePickerVisible(false)}
        onConfirm={(time) => setFieldValue(timeField, time)}
        initialTime={chosenTime}
        title={
          timeField === 'startedAt' ? 'Select start time' : 'Select end time'
        }
      />
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
})
