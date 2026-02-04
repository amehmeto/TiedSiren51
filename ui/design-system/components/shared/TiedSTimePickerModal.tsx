import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from './TiedSButton'
import { TiedSCloseButton } from './TiedSCloseButton'
import { TiedSModal } from './TiedSModal'
import { TimeStepper } from './TimeStepper'

type TiedSTimePickerModalProps = Readonly<{
  visible: boolean
  onClose: () => void
  onConfirm: (time: string) => void
  initialTime?: string
  title?: string
}>

function parseHHmm(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number)
  return {
    hours: Number.isFinite(h) ? Math.min(Math.max(h, 0), 23) : 0,
    minutes: Number.isFinite(m) ? Math.min(Math.max(m, 0), 59) : 0,
  }
}

function formatHHmm(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function TiedSTimePickerModal({
  visible: isVisible,
  onClose,
  onConfirm,
  initialTime = '00:00',
  title = 'Select time',
}: TiedSTimePickerModalProps) {
  const parsed = parseHHmm(initialTime)
  const [hours, setHours] = useState(parsed.hours)
  const [minutes, setMinutes] = useState(parsed.minutes)

  const preview = formatHHmm(hours, minutes)

  const handleConfirm = useCallback(() => {
    onConfirm(formatHHmm(hours, minutes))
    onClose()
  }, [hours, minutes, onConfirm, onClose])

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <TiedSCloseButton onClose={onClose} />

        <Text style={styles.title}>{title}</Text>

        <View style={styles.pickerContainer}>
          <TimeStepper
            selectedValue={hours}
            onValueChange={setHours}
            max={23}
            labelSingular="hour"
            labelPlural="hours"
          />
          <Text style={styles.colon}>:</Text>
          <TimeStepper
            selectedValue={minutes}
            onValueChange={setMinutes}
            max={59}
            labelSingular="min"
            labelPlural="min"
          />
        </View>

        <Text style={styles.preview}>{preview}</Text>

        <TiedSButton
          onPress={handleConfirm}
          text="Confirm"
          style={styles.confirmButton}
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
    alignItems: 'center',
    marginVertical: T.spacing.small,
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
    paddingHorizontal: T.spacing.small,
    paddingVertical: T.spacing.smallMedium,
    gap: T.spacing.small,
  },
  colon: {
    color: T.color.white,
    fontSize: T.font.size.xLarge,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    alignSelf: 'center',
  },
  preview: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginVertical: T.spacing.medium,
    fontFamily: T.font.family.primary,
  },
  confirmButton: {
    marginTop: T.spacing.medium,
  },
})
