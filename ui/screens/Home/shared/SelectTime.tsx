import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { T } from '@/ui/design-system/theme'
import React from 'react'
import { dependencies } from '@/ui/dependencies'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { WebTimePicker } from '@/ui/screens/Home/shared/WebTimePicker'

/*export function toHHmm(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}*/

export function SelectTime({
  timeField = 'startedAt', // Default to 'startedAt'
  setIsTimePickerVisible,
  values,
  isTimePickerVisible = false, // Default to false
  setFieldValue,
  handleChange,
}: Readonly<{
  timeField?: 'startedAt' | 'endedAt'
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
  values: Session
  isTimePickerVisible?: boolean
  setFieldValue: (field: string, value: string) => void
  handleChange: (field: 'startedAt' | 'endedAt') => void
}>) {
  const { dateProvider } = dependencies
  const localeNow = dateProvider.toHHmm(new Date())

  const chosenTime =
    timeField === 'startedAt'
      ? values.startedAt ?? localeNow
      : values.endedAt ?? localeNow

  const placeholder =
    timeField === 'startedAt'
      ? values.startedAt ?? `Select start time...`
      : values.endedAt ?? `Select end time...`

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>{timeField}</Text>
        <Pressable onPress={() => setIsTimePickerVisible(true)}>
          <Text style={styles.option}>{placeholder}</Text>
        </Pressable>
      </View>
      <View>
        {Platform.OS === 'web' ? (
          isTimePickerVisible && (
            <WebTimePicker
              chosenTime={chosenTime}
              handleChange={() => handleChange(timeField)}
              setTime={(chosenTime: string) => {
                setFieldValue(timeField, chosenTime)
              }}
              setIsTimePickerVisible={setIsTimePickerVisible}
            />
          )
        ) : (
          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            is24Hour={true}
            mode="time"
            onConfirm={(date) => {
              setFieldValue(timeField, dateProvider.toHHmm(date))
              setIsTimePickerVisible(false)
            }}
            onCancel={() => setIsTimePickerVisible(false)}
          />
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  blockSession: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
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
