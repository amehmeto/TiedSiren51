import { Picker } from '@react-native-picker/picker'
import React, { useMemo } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TimePickerProps = {
  selectedValue: number
  onValueChange: (value: number) => void
  max: number
  labelSingular: string
  labelPlural: string
}

export const TimePicker = ({
  selectedValue,
  onValueChange,
  max,
  labelSingular,
  labelPlural,
}: Readonly<TimePickerProps>) => {
  const items = useMemo(
    () => Array.from({ length: max + 1 }, (_, i) => i),
    [max],
  )

  return (
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(value) => onValueChange(value)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
        mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
        dropdownIconColor={T.color.white}
      >
        {items.map((value) => (
          <Picker.Item
            key={`${labelSingular}-${value}`}
            label={`${value} ${value !== 1 ? labelPlural : labelSingular}`}
            value={value}
            color={T.color.textSecondary}
          />
        ))}
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 50,
    color: T.color.white,
  },
  pickerItem: {
    color: T.color.white,
    fontSize: T.font.size.regular,
    height: Platform.OS === 'ios' ? 180 : undefined,
  },
})
