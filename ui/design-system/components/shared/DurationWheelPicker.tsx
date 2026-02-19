import WheelPicker from '@quidone/react-native-wheel-picker'
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback'
import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

type DurationWheelPickerProps = {
  days: number
  hours: number
  minutes: number
  onDaysChange: (days: number) => void
  onHoursChange: (hours: number) => void
  onMinutesChange: (minutes: number) => void
}

const MAX_DAYS = 30
const MAX_HOURS = 23
const MAX_MINUTES = 59

const ITEM_HEIGHT = 44
const VISIBLE_ITEM_COUNT = 5

function generateItems(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }))
}

function triggerFeedback() {
  WheelPickerFeedback.triggerSoundAndImpact()
}

export const DurationWheelPicker = ({
  days,
  hours,
  minutes,
  onDaysChange,
  onHoursChange,
  onMinutesChange,
}: Readonly<DurationWheelPickerProps>) => {
  const dayItems = useMemo(() => generateItems(MAX_DAYS), [])
  const hourItems = useMemo(() => generateItems(MAX_HOURS), [])
  const minuteItems = useMemo(() => generateItems(MAX_MINUTES), [])

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.label}>Days</Text>
        <WheelPicker
          data={dayItems}
          value={days}
          onValueChanging={triggerFeedback}
          onValueChanged={({ item: { value } }) => onDaysChange(value)}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEM_COUNT}
          itemTextStyle={styles.itemText}
          overlayItemStyle={styles.overlayItem}
          style={styles.picker}
        />
      </View>

      <View style={styles.column}>
        <Text style={styles.label}>Hours</Text>
        <WheelPicker
          data={hourItems}
          value={hours}
          onValueChanging={triggerFeedback}
          onValueChanged={({ item: { value } }) => onHoursChange(value)}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEM_COUNT}
          itemTextStyle={styles.itemText}
          overlayItemStyle={styles.overlayItem}
          style={styles.picker}
        />
      </View>

      <View style={styles.column}>
        <Text style={styles.label}>Min</Text>
        <WheelPicker
          data={minuteItems}
          value={minutes}
          onValueChanging={triggerFeedback}
          onValueChanged={({ item: { value } }) => onMinutesChange(value)}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEM_COUNT}
          itemTextStyle={styles.itemText}
          overlayItemStyle={styles.overlayItem}
          style={styles.picker}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    marginVertical: T.spacing.medium,
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
    paddingHorizontal: T.spacing.small,
    paddingVertical: T.spacing.medium,
    gap: T.spacing.small,
  },
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
  itemText: {
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
