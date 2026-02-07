import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { assertHHmmString } from '@/core/_ports_/date-provider'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { TimePicker } from '@/ui/screens/Home/shared/TimePicker'
import {
  StrictBoundDirection,
  validateStrictModeTime,
} from '@/ui/screens/Home/shared/validateStrictBoundTime'

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
  initialTime?: string | null
  /** The initial value of the other time field, for midnight-spanning session detection */
  initialOtherTime?: string | null
}>

export function SelectTime({
  timeField = TimeField.StartedAt,
  setIsTimePickerVisible,
  values,
  isTimePickerVisible = false,
  setFieldValue,
  handleChange,
  initialTime,
  initialOtherTime,
}: SelectTimeProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies
  const localeNow = dateProvider.getHHmmNow()
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dateProvider),
  )

  const chosenTime =
    timeField === TimeField.StartedAt
      ? (values.startedAt ?? localeNow)
      : (values.endedAt ?? localeNow)

  const direction =
    timeField === TimeField.StartedAt
      ? StrictBoundDirection.Earlier
      : StrictBoundDirection.Later

  const placeholder =
    timeField === TimeField.StartedAt
      ? (values.startedAt ?? `Select start time...`)
      : (values.endedAt ?? `Select end time...`)

  assertHHmmString(chosenTime)
  const chosenTimeAsDate = dateProvider.recoverDate(chosenTime)

  const handleTimeChange = (time: string) => {
    const validation = validateStrictModeTime({
      newTime: time,
      isStrictModeActive,
      initialTime,
      direction,
      otherBound: initialOtherTime,
    })

    if (!validation.isValid) {
      dispatch(showToast(validation.errorMessage))
      return
    }

    setFieldValue(timeField, time)
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
        <TimePicker
          isVisible={isTimePickerVisible}
          chosenTimeAsDate={chosenTimeAsDate}
          onConfirm={(date) => {
            handleTimeChange(dateProvider.toHHmm(date))
            setIsTimePickerVisible(false)
          }}
          onCancel={() => setIsTimePickerVisible(false)}
          chosenTime={chosenTime}
          handleChange={() => handleChange(timeField)}
          setTime={handleTimeChange}
          setIsTimePickerVisible={setIsTimePickerVisible}
        />
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
