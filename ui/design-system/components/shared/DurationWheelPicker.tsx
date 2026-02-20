import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { TimerDuration } from '@/ui/design-system/components/shared/TimerPickerModal'
import { WheelColumn } from '@/ui/design-system/components/shared/WheelColumn'
import { T } from '@/ui/design-system/theme'

type DurationWheelPickerProps = {
  duration: TimerDuration
  onDurationChange: (duration: TimerDuration) => void
}

const MAX_DAYS = 30
const MAX_HOURS = 23
const MAX_MINUTES = 59

function generatePickerValues(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }))
}

export const DurationWheelPicker = ({
  duration,
  onDurationChange,
}: Readonly<DurationWheelPickerProps>) => {
  const { days, hours, minutes } = duration
  const dayPickerValues = useMemo(() => generatePickerValues(MAX_DAYS), [])
  const hourPickerValues = useMemo(() => generatePickerValues(MAX_HOURS), [])
  const minutePickerValues = useMemo(
    () => generatePickerValues(MAX_MINUTES),
    [],
  )

  return (
    <View style={styles.container}>
      <WheelColumn
        label="Days"
        pickerValues={dayPickerValues}
        selectedValue={days}
        onValueChanged={(newDays) =>
          onDurationChange({ ...duration, days: newDays })
        }
      />
      <WheelColumn
        label="Hours"
        pickerValues={hourPickerValues}
        selectedValue={hours}
        onValueChanged={(newHours) =>
          onDurationChange({ ...duration, hours: newHours })
        }
      />
      <WheelColumn
        label="Min"
        pickerValues={minutePickerValues}
        selectedValue={minutes}
        onValueChanged={(newMinutes) =>
          onDurationChange({ ...duration, minutes: newMinutes })
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    marginVertical: T.spacing.medium,
    backgroundColor: T.color.surfaceElevated,
    borderRadius: T.border.radius.roundedMedium,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
    paddingHorizontal: T.spacing.small,
    paddingVertical: T.spacing.medium,
    gap: T.spacing.small,
  },
})
