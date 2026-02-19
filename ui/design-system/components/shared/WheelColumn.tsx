import WheelPicker from '@quidone/react-native-wheel-picker'
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

type PickerValue = {
  value: number
  label: string
}

type WheelColumnProps = {
  label: string
  pickerValues: PickerValue[]
  selectedValue: number
  onValueChanged: (value: number) => void
}

const VISIBLE_ITEM_COUNT = 5

export const WheelColumn = ({
  label,
  pickerValues,
  selectedValue,
  onValueChanged,
}: Readonly<WheelColumnProps>) => (
  <View style={styles.column}>
    <Text style={styles.label}>{label}</Text>
    <WheelPicker
      data={pickerValues}
      value={selectedValue}
      onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
      onValueChanged={({ item: { value } }) => onValueChanged(value)}
      itemHeight={T.height.pickerItem}
      visibleItemCount={VISIBLE_ITEM_COUNT}
      itemTextStyle={styles.wheelText}
      overlayItemStyle={styles.overlayItem}
      style={styles.picker}
      enableScrollByTapOnItem
    />
  </View>
)

const styles = StyleSheet.create({
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    fontWeight: T.font.weight.medium,
    marginBottom: T.spacing.small,
    textTransform: 'uppercase',
    letterSpacing: T.font.letterSpacing.normal,
  },
  picker: {
    width: '100%',
  },
  wheelText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontFamily: T.font.family.primary,
    fontWeight: T.font.weight.semibold,
  },
  overlayItem: {
    backgroundColor: T.color.lightBlueOverlay,
    borderRadius: T.border.radius.roundedSmall,
  },
})
