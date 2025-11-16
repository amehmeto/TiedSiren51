import { Picker } from '@react-native-picker/picker'
import { BlurView } from 'expo-blur'
import React, { useState, useMemo } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { T } from '@/ui/design-system/theme'

interface TimerPickerModalProps {
  visible: boolean
  onClose: () => void
  onSave: (days: number, hours: number, minutes: number) => void
  title?: string
}

export const TimerPickerModal: React.FC<TimerPickerModalProps> = ({
  visible,
  onClose,
  onSave,
  title = 'Set the timer',
}) => {
  const [selectedDays, setSelectedDays] = useState(1)
  const [selectedHours, setSelectedHours] = useState(0)
  const [selectedMinutes, setSelectedMinutes] = useState(0)

  const dayItems = useMemo(() => Array.from({ length: 31 }, (_, i) => i), [])
  const hourItems = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minuteItems = useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

  const endDateTime = useMemo(() => {
    const now = new Date()
    const endTime = new Date(
      now.getTime() +
        selectedDays * 24 * 60 * 60 * 1000 +
        selectedHours * 60 * 60 * 1000 +
        selectedMinutes * 60 * 1000,
    )

    const day = endTime.getDate()
    const month = endTime.getMonth() + 1
    const hours = endTime.getHours()
    const minutes = endTime.getMinutes()
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.'
    const displayHours = hours % 12 || 12

    return `Ends ${day}/${month}, ${displayHours}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`
  }, [selectedDays, selectedHours, selectedMinutes])

  const handleSave = () => {
    onSave(selectedDays, selectedHours, selectedMinutes)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDays}
                onValueChange={(value) => setSelectedDays(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                dropdownIconColor={T.color.white}
              >
                {dayItems.map((day) => (
                  <Picker.Item
                    key={`day-${day}`}
                    label={`${day} day${day !== 1 ? 's' : ''}`}
                    value={day}
                    color={T.color.modalBackgroundColor}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedHours}
                onValueChange={(value) => setSelectedHours(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                dropdownIconColor={T.color.white}
              >
                {hourItems.map((hour) => (
                  <Picker.Item
                    key={`hour-${hour}`}
                    label={`${hour} hour${hour !== 1 ? 's' : ''}`}
                    value={hour}
                    color={T.color.modalBackgroundColor}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMinutes}
                onValueChange={(value) => setSelectedMinutes(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                dropdownIconColor={T.color.white}
              >
                {minuteItems.map((minute) => (
                  <Picker.Item
                    key={`minute-${minute}`}
                    label={`${minute} min`}
                    value={minute}
                    color={T.color.modalBackgroundColor}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.endTimeText}>{endDateTime}</Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
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
  closeButtonText: {
    color: T.color.lightBlue,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
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
    backgroundColor: T.color.modalBackgroundColor,
    borderRadius: T.border.radius.roundedMedium,
    paddingVertical: Platform.OS === 'ios' ? 0 : T.spacing.small,
  },
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
    color: T.color.red,
    fontSize: T.font.size.regular,
    height: Platform.OS === 'ios' ? 180 : undefined,
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
  saveButtonText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
})
