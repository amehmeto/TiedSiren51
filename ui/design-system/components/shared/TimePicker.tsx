import { Picker } from '@react-native-picker/picker'
import React, { useMemo } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TimePickerProps = {
  selectedValue: number
  onValueChange: (timeUnit: number) => void
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
  const createRangeFromZeroTo = (max: number) =>
    Array.from({ length: max + 1 }, (_, i) => i)

  const timeOptions = useMemo(() => createRangeFromZeroTo(max), [max])

  return (
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(timeUnit) => onValueChange(timeUnit)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
        mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
        dropdownIconColor={T.color.white}
      >
        {timeOptions.map((timeUnit) => (
          <Picker.Item
            key={`${labelSingular}-${timeUnit}`}
            label={`${timeUnit} ${timeUnit !== 1 ? labelPlural : labelSingular}`}
            value={timeUnit}
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
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: T.spacing.extraExtraSmall,
  },
  picker: {
    width: T.layout.width.full,
    color: T.color.white,
  },
  pickerItem: {
    color: T.color.white,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
  },
})
