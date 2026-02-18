import React, { useCallback, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { assertHHmmString, HHmmString } from '@/core/_ports_/date-provider'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import {
  StrictBoundDirection,
  validateStrictModeTime,
} from '@/core/strict-mode/validate-strict-bound-time'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { TimePicker } from '@/ui/screens/Home/shared/TimePicker'

export enum TimeField {
  StartedAt = 'startedAt',
  EndedAt = 'endedAt',
}

type SelectTimeFields = {
  timeField?: TimeField
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
  values: BlockSessionFormValues
  isTimePickerVisible?: boolean
  setFieldValue: (field: string, value: string) => void
  handleChange: (field: TimeField) => void
  initialTime?: HHmmString | null
  /** The initial value of the other time field, for midnight-spanning session detection */
  initialOtherTime?: HHmmString | null
}

type SelectTimeProps = Readonly<SelectTimeFields>

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

  const pendingTimeRef = useRef<HHmmString | null>(null)

  const handleTimeChange = useCallback(
    (selectedTime: HHmmString) => {
      const validation = validateStrictModeTime({
        newTime: selectedTime,
        isStrictModeActive,
        initialTime,
        direction,
        otherBound: initialOtherTime,
      })

      if (!validation.isValid) {
        dispatch(showToast(validation.errorMessage))
        return
      }

      setFieldValue(timeField, selectedTime)
    },
    [
      isStrictModeActive,
      initialTime,
      direction,
      initialOtherTime,
      dispatch,
      setFieldValue,
      timeField,
    ],
  )

  const handleConfirm = useCallback(
    (date: Date) => {
      pendingTimeRef.current = dateProvider.toHHmm(date)
      setIsTimePickerVisible(false)
    },
    [dateProvider, setIsTimePickerVisible],
  )

  const handleCancel = useCallback(() => {
    pendingTimeRef.current = null
    setIsTimePickerVisible(false)
  }, [setIsTimePickerVisible])

  const handleHide = useCallback(() => {
    if (pendingTimeRef.current) {
      const confirmedTime = pendingTimeRef.current
      pendingTimeRef.current = null
      // Defer the field update to a separate render cycle so the picker's
      // isVisible=false is committed before the date prop changes. Without
      // this, React may batch both updates and the memo in
      // DateTimePickerModal.android sees a new date while isVisible is still
      // true, causing the picker to reappear.
      requestAnimationFrame(() => handleTimeChange(confirmedTime))
    }
  }, [handleTimeChange])

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
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onHide={handleHide}
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
