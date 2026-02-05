import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { WebTimePicker } from '@/ui/screens/Home/shared/WebTimePicker'

export enum StrictBoundDirection {
  Earlier = 'earlier',
  Later = 'later',
}

export type StrictBound = Readonly<{
  direction: StrictBoundDirection
  limit: string
}>

export const computeStrictBound = (
  isStrictModeActive: boolean,
  direction: StrictBoundDirection,
  limit?: string | null,
): StrictBound | undefined =>
  isStrictModeActive && limit ? { direction, limit } : undefined

function formatTimeString(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export enum TimeField {
  StartedAt = 'startedAt',
  EndedAt = 'endedAt',
}

type SelectTimeProps = Readonly<{
  timeField?: TimeField
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
  values: BlockSessionFormValues
  isTimePickerVisible?: boolean
  setFieldValue: (field: string, value: string) => void
  handleChange: (field: TimeField) => void
  strictBound?: StrictBound
}>

export function SelectTime({
  timeField = TimeField.StartedAt,
  setIsTimePickerVisible,
  values,
  isTimePickerVisible = false,
  setFieldValue,
  handleChange,
  strictBound,
}: SelectTimeProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies
  const localeNow = dateProvider.getHHmmNow()

  const chosenTime =
    timeField === TimeField.StartedAt
      ? (values.startedAt ?? localeNow)
      : (values.endedAt ?? localeNow)

  const placeholder =
    timeField === TimeField.StartedAt
      ? (values.startedAt ?? `Select start time...`)
      : (values.endedAt ?? `Select end time...`)

  const handleTimeChange = (time: string) => {
    const formattedTime = formatTimeString(time)

    if (strictBound) {
      const isInvalid =
        strictBound.direction === StrictBoundDirection.Earlier
          ? formattedTime > strictBound.limit
          : formattedTime < strictBound.limit

      if (isInvalid) {
        const message =
          strictBound.direction === StrictBoundDirection.Earlier
            ? 'Cannot set a later start time during strict mode'
            : 'Cannot set an earlier end time during strict mode'
        dispatch(showToast(message))
        return
      }
    }

    setFieldValue(timeField, formattedTime)
  }

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>
          {timeField === TimeField.StartedAt ? 'Start Time' : 'End Time'}
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
