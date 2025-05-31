import React from 'react'
import { StyleSheet, View } from 'react-native'

export function WebTimePicker(
  props: Readonly<{
    chosenTime: string
    setTime: (chosenTime: string) => void
    handleChange: (field: string) => void
    setIsTimePickerVisible: (value: React.SetStateAction<boolean>) => void
  }>,
) {
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    props.handleChange(time)
    props.setTime(time)
  }

  return (
    <View style={styles.webTimePicker}>
      <input
        aria-label={'Time'}
        type={'time'}
        value={props.chosenTime}
        onChange={handleTimeChange}
        required
        pattern="[0-2][0-9]:[0-5][0-9]"
      />
      <button
        type={'button'}
        onClick={() => {
          props.setTime(props.chosenTime)
          props.setIsTimePickerVisible(false)
        }}
      >
        Confirm
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
