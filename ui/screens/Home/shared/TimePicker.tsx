import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { T } from '@/ui/design-system/theme'
import { WebTimePicker } from '@/ui/screens/Home/shared/WebTimePicker'

type TimePickerProps = Readonly<{
  isVisible: boolean
  chosenTimeAsDate: Date
  onConfirm: (date: Date) => void
  onCancel: () => void
  chosenTime: string
  handleChange: () => void
  setTime: (time: string) => void
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
}>

export function TimePicker({
  isVisible,
  chosenTimeAsDate,
  onConfirm,
  onCancel,
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
