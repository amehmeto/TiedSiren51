import React from 'react'
import { StyleSheet, View } from 'react-native'

type WebTimePickerProps = Readonly<{
  chosenTime: string
  setTime: (chosenTime: string) => void
  handleChange: (field: string) => void
  setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
}>

export function WebTimePicker({
  chosenTime,
  setTime,
  handleChange,
  setIsTimePickerVisible,
}: WebTimePickerProps) {
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    handleChange(time)
    setTime(time)
  }

  return (
    <View style={styles.webTimePicker}>
      <input
        aria-label={'Time'}
        type={'time'}
        value={chosenTime}
        onChange={handleTimeChange}
        required
        pattern="[0-2][0-9]:[0-5][0-9]"
      />
      <button
        type={'button'}
        onClick={() => {
          setTime(chosenTime)
          setIsTimePickerVisible(false)
        }}
      >
        {/* eslint-disable-next-line react-native/no-raw-text -- Web-only component using HTML button */}
        {'Confirm'}
      </button>
    </View>
  )
}

const styles = StyleSheet.create({
  webTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
