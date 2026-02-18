import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { HHmmString } from '@/core/_ports_/date-provider'
import { T } from '@/ui/design-system/theme'
import { WebTimePicker } from '@/ui/screens/Home/shared/WebTimePicker'

type TimePickerFields = {
  isVisible: boolean
  chosenTimeAsDate: Date
  onConfirm: (date: Date) => void
  onCancel: () => void
  onHide?: () => void
  chosenTime: HHmmString
  handleChange: () => void
  setTime: (time: HHmmString) => void
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
}

type TimePickerProps = Readonly<TimePickerFields>

export function TimePicker({
  isVisible,
  chosenTimeAsDate,
  onConfirm,
  onCancel,
  onHide,
  chosenTime,
  handleChange,
  setTime,
  setIsTimePickerVisible,
}: TimePickerProps) {
  if (Platform.OS === 'web') {
    if (!isVisible) return null
    return (
      <WebTimePicker
        chosenTime={chosenTime}
        handleChange={handleChange}
        setTime={setTime}
        setIsTimePickerVisible={setIsTimePickerVisible}
      />
    )
  }
  return (
    <DateTimePickerModal
      date={chosenTimeAsDate}
      isVisible={isVisible}
      is24Hour={true}
      mode="time"
      isDarkModeEnabled={true}
      themeVariant="dark"
      accentColor={T.color.lightBlue}
      buttonTextColorIOS={T.color.lightBlue}
      textColor={T.color.white}
      pickerContainerStyleIOS={styles.pickerContainer}
      modalStyleIOS={styles.modalStyle}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onHide={onHide}
    />
  )
}

const styles = StyleSheet.create({
  pickerContainer: {
    borderRadius: T.border.radius.extraRounded,
    overflow: 'hidden',
  },
  modalStyle: {
    borderRadius: T.border.radius.extraRounded,
  },
})
