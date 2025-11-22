import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { formatEndFromOffsets } from '@/ui/utils/timeFormat'
import { TiedSButton } from './TiedSButton'
import { TiedSCloseButton } from './TiedSCloseButton'
import { TiedSModal } from './TiedSModal'
import { TimeStepper } from './TimeStepper'

type TimerPickerModalProps = {
  visible: boolean
  onClose: () => void
  onSave: (days: number, hours: number, minutes: number) => void
  title?: string
}

export const TimerPickerModal = ({
  visible,
  onClose,
  onSave,
  title = 'Set the timer',
}: Readonly<TimerPickerModalProps>) => {
  const [selectedDays, setSelectedDays] = useState(1)
  const [selectedHours, setSelectedHours] = useState(0)
  const [selectedMinutes, setSelectedMinutes] = useState(0)

  const isZeroDuration = useMemo(
    () => selectedDays === 0 && selectedHours === 0 && selectedMinutes === 0,
    [selectedDays, selectedHours, selectedMinutes],
  )

  const endDateTime = useMemo(
    () =>
      formatEndFromOffsets({
        days: selectedDays,
        hours: selectedHours,
        minutes: selectedMinutes,
      }),
    [selectedDays, selectedHours, selectedMinutes],
  )

  const handleSave = () => {
    if (isZeroDuration) return
    onSave(selectedDays, selectedHours, selectedMinutes)
    onClose()
  }

  return (
    <TiedSModal isVisible={visible} onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <TiedSCloseButton onClose={onClose} />

        <Text style={styles.title}>{title}</Text>

        <View style={styles.pickerContainer}>
          <TimeStepper
            selectedValue={selectedDays}
            onValueChange={setSelectedDays}
            max={30}
            labelSingular="day"
            labelPlural="days"
          />
          <TimeStepper
            selectedValue={selectedHours}
            onValueChange={setSelectedHours}
            max={23}
            labelSingular="hour"
            labelPlural="hours"
          />
          <TimeStepper
            selectedValue={selectedMinutes}
            onValueChange={setSelectedMinutes}
            max={59}
            labelSingular="min"
            labelPlural="min"
          />
        </View>

        <Text style={styles.endTimeText}>{endDateTime}</Text>

        <TiedSButton
          onPress={handleSave}
          text="Save"
          disabled={isZeroDuration}
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
