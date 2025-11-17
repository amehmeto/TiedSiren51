import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { formatEndFromOffsets } from '@/ui/utils/timeFormat'
import { TiedSButton } from './TiedSButton'
import { TiedSCloseButton } from './TiedSCloseButton'
import { TiedSModal } from './TiedSModal'
import { TimePicker } from './TimePicker'

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
    <TiedSModal
      isVisible={visible}
      onRequestClose={onClose}
      style={styles.modalContent}
    >
      <View style={styles.container}>
        <TiedSCloseButton onClose={onClose} />

        <Text style={styles.title}>{title}</Text>

        <View style={styles.pickerContainer}>
          <TimePicker
            selectedValue={selectedDays}
            onValueChange={setSelectedDays}
            max={30}
            labelSingular="day"
            labelPlural="days"
          />
          <TimePicker
            selectedValue={selectedHours}
            onValueChange={setSelectedHours}
            max={23}
            labelSingular="hour"
            labelPlural="hours"
          />
          <TimePicker
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
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 0.3,
    backgroundColor: T.color.darkBlueGray,
    width: Dimensions.get('window').width * 0.9,
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: T.spacing.medium,
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
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
