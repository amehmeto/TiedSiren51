import React, { useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { dependencies } from '@/ui/dependencies'
import { T } from '@/ui/design-system/theme'
import { formatEndFromOffsets } from '@/ui/utils/timeFormat'
import { TiedSButton } from './TiedSButton'
import { TiedSCloseButton } from './TiedSCloseButton'
import { TiedSModal } from './TiedSModal'
import { TimeStepper } from './TimeStepper'

export type TimerDuration = {
  days: number
  hours: number
  minutes: number
}

type TimerPickerModalProps = {
  visible: boolean
  onClose: () => void
  onSave: () => void
  duration: TimerDuration
  onDurationChange: (duration: TimerDuration) => void
  title?: string
}

export const TimerPickerModal = ({
  visible: isVisible,
  onClose,
  onSave,
  duration,
  onDurationChange,
  title = 'Set the timer',
}: Readonly<TimerPickerModalProps>) => {
  const isZeroDuration =
    duration.days === 0 && duration.hours === 0 && duration.minutes === 0

  const { dateProvider } = dependencies
  const endDateTime = useMemo(
    () => formatEndFromOffsets({ ...duration, dateProvider }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dateProvider is a stable singleton
    [duration],
  )

  const handleSave = () => {
    if (isZeroDuration) return
    onSave()
    onClose()
  }

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <TiedSCloseButton onClose={onClose} />

        <Text style={styles.title}>{title}</Text>

        <View style={styles.pickerContainer}>
          <TimeStepper
            selectedValue={duration.days}
            onValueChange={(days) => onDurationChange({ ...duration, days })}
            max={30}
            labelSingular="day"
            labelPlural="days"
          />
          <TimeStepper
            selectedValue={duration.hours}
            onValueChange={(hours) => onDurationChange({ ...duration, hours })}
            max={23}
            labelSingular="hour"
            labelPlural="hours"
          />
          <TimeStepper
            selectedValue={duration.minutes}
            onValueChange={(minutes) =>
              onDurationChange({ ...duration, minutes })
            }
            max={59}
            labelSingular="min"
            labelPlural="min"
          />
        </View>

        <Text style={styles.endTimeText}>{endDateTime}</Text>

        <TiedSButton
          onPress={handleSave}
          text="Save"
          isDisabled={isZeroDuration}
          style={styles.saveButton}
        />
      </ScrollView>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: T.spacing.large,
    paddingBottom: T.spacing.x_large,
  },
  title: {
    color: T.color.white,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.large,
  },
  pickerContainer: {
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
  endTimeText: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginVertical: T.spacing.medium,
    fontFamily: T.font.family.primary,
  },
  saveButton: {
    marginTop: T.spacing.medium,
  },
})
