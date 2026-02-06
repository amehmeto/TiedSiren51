import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import {
  StrictBoundDirection,
  validateStrictModeTime,
} from '@/ui/screens/Home/shared/validateStrictBoundTime'
import { WebTimePicker } from '@/ui/screens/Home/shared/WebTimePicker'

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

  const pickerDate = (() => {
    const [h, m] = chosenTime.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
  })()

  const handleTimeChange = (time: string) => {
    const formattedTime = formatTimeString(time)

    const validation = validateStrictModeTime({
      newTime: formattedTime,
      isStrictModeActive,
      initialTime,
      direction,
      otherBound: initialOtherTime,
    })

    if (!validation.isValid) {
      dispatch(showToast(validation.errorMessage))
      return
    }

    setFieldValue(timeField, formattedTime)
  }

  let timePicker: React.ReactNode = null

  if (Platform.OS === 'web') {
    if (isTimePickerVisible) {
      timePicker = (
        <WebTimePicker
          chosenTime={chosenTime}
          handleChange={() => handleChange(timeField)}
          setTime={handleTimeChange}
          setIsTimePickerVisible={setIsTimePickerVisible}
        />
      )
    }
  } else {
    timePicker = (
      <DateTimePickerModal
        date={pickerDate}
        isVisible={isTimePickerVisible}
        is24Hour={true}
        mode="time"
        isDarkModeEnabled={true}
        themeVariant="dark"
        accentColor={T.color.lightBlue}
        buttonTextColorIOS={T.color.lightBlue}
        textColor={T.color.white}
        pickerContainerStyleIOS={styles.pickerContainer}
        modalStyleIOS={styles.modalStyle}
        onConfirm={(date) => {
          handleTimeChange(dateProvider.toHHmm(date))
          setIsTimePickerVisible(false)
        }}
        onCancel={() => setIsTimePickerVisible(false)}
      />
    )
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
      <View>{timePicker}</View>
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
  pickerContainer: {
    borderRadius: T.border.radius.extraRounded,
    overflow: 'hidden',
  },
  modalStyle: {
    borderRadius: T.border.radius.extraRounded,
  },
})
