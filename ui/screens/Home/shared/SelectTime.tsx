import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { WebTimePicker } from '@/ui/screens/Home/shared/WebTimePicker'

function formatTimeString(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

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
      ? (values.startedAt ?? localeNow)
      : (values.endedAt ?? localeNow)

  const placeholder =
    timeField === 'startedAt'
      ? (values.startedAt ?? `Select start time...`)
      : (values.endedAt ?? `Select end time...`)

  const handleTimeChange = (time: string) => {
    const formattedTime = formatTimeString(time)
    setFieldValue(timeField, formattedTime)
  }

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
      <View>
        {Platform.OS === 'web' ? (
          isTimePickerVisible && (
            <WebTimePicker
              chosenTime={chosenTime}
              handleChange={() => handleChange(timeField)}
              setTime={handleTimeChange}
              setIsTimePickerVisible={setIsTimePickerVisible}
            />
          )
        ) : (
          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            is24Hour={true}
            mode="time"
            onConfirm={(date) => {
              handleTimeChange(dateProvider.toHHmm(date))
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
