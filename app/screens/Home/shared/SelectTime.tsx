import { Session } from './BlockSessionForm'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { T } from '@/app/design-system/theme'
import React from 'react'
import { WebTimePicker } from './WebTimePicker'
import { dependencies } from '@/app/dependencies'

export function SelectTime(
  props: Readonly<{
    timeField: 'startedAt' | 'endedAt'
    setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
    values: Session
    isTimePickerVisible: boolean
    setFieldValue: (field: string, value: string) => void
    handleChange: (field: 'startedAt' | 'endedAt') => void
  }>,
) {
  const { dateProvider } = dependencies
  const localeNow = dateProvider.toHHmm(new Date())

  const chosenTime =
    props.timeField === 'startedAt'
      ? props.values.startedAt ?? localeNow
      : props.values.endedAt ?? localeNow

  const placeholder =
    props.timeField === 'startedAt'
      ? props.values.startedAt ?? `Select start time...`
      : props.values.endedAt ?? `Select end time...`

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>{props.timeField}</Text>
        <Pressable onPress={() => props.setIsTimePickerVisible(true)}>
          <Text style={styles.option}>{placeholder}</Text>
        </Pressable>
      </View>
      <View>
        {Platform.OS === 'web' ? (
          props.isTimePickerVisible && (
            <WebTimePicker
              chosenTime={chosenTime}
              handleChange={() => props.handleChange(props.timeField)}
              setTime={(chosenTime: string) => {
                props.setFieldValue(props.timeField, chosenTime)
              }}
              setIsTimePickerVisible={props.setIsTimePickerVisible}
            />
          )
        ) : (
          <DateTimePickerModal
            isVisible={props.isTimePickerVisible}
            is24Hour={true}
            mode="time"
            onConfirm={(date) => {
              props.setFieldValue(props.timeField, dateProvider.toHHmm(date))
              props.setIsTimePickerVisible(false)
            }}
            onCancel={() => props.setIsTimePickerVisible(false)}
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
