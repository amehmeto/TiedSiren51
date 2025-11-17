import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import React, { useState, useMemo } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native'
import { T } from '@/ui/design-system/theme'
import { formatEndFromOffsets } from '@/ui/utils/timeFormat'
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={T.font.size.large}
                color={T.color.lightBlue}
              />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
          </View>

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

          <Pressable
            style={[
              styles.saveButton,
              isZeroDuration && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isZeroDuration}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.saveButtonText,
                  pressed && !isZeroDuration && styles.pressed,
                ]}
              >
                {'Save'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: T.color.darkBlue,
    borderTopLeftRadius: T.border.radius.extraRounded,
    borderTopRightRadius: T.border.radius.extraRounded,
    paddingTop: T.spacing.large,
    paddingBottom: Platform.OS === 'ios' ? T.spacing.xx_large : T.spacing.large,
    paddingHorizontal: T.spacing.large,
    minHeight: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: T.spacing.large,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: T.spacing.small,
    zIndex: 1,
  },
  title: {
    color: T.color.white,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: T.spacing.large,
    backgroundColor: T.color.cardBg,
    borderRadius: T.border.radius.roundedMedium,
    paddingVertical: Platform.OS === 'ios' ? 0 : T.spacing.small,
  },
  endTimeText: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginVertical: T.spacing.large,
    fontFamily: T.font.family.primary,
  },
  saveButton: {
    backgroundColor: T.color.lightBlue,
    borderRadius: T.border.radius.extraRounded,
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
    marginTop: T.spacing.large,
    shadowColor: T.color.lightBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  pressed: {
    opacity: 0.7,
  },
})
