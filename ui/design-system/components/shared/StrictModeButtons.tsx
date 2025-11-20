import React from 'react'
import { StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { StartTimerButton } from './StartTimerButton'
import { TiedSButton } from './TiedSButton'

type StrictModeButtonsProps = {
  isActive: boolean
  onStartTimer: () => void
  onExtendTimer: () => void
  onStopTimer?: () => void
}

export const StrictModeButtons = ({
  isActive,
  onStartTimer,
  onExtendTimer,
  onStopTimer,
}: Readonly<StrictModeButtonsProps>) => {
  if (!isActive) return <StartTimerButton onStartTimer={onStartTimer} />

  return (
    <View style={styles.actionButtons}>
      <TiedSButton
        onPress={onExtendTimer}
        text="Extend Timer"
        style={styles.primaryButton}
      />
      {onStopTimer && (
        <TiedSButton
          onPress={onStopTimer}
          text="Stop Timer"
          style={styles.dangerButton}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: T.border.radius.extraRounded,
    overflow: 'hidden',
    shadowColor: T.color.lightBlue,
    shadowOffset: T.shadow.offsets.medium,
    shadowOpacity: 0.3,
    shadowRadius: T.shadow.radius.medium,
    elevation: T.elevation.highest,
  },
  actionButtons: {
    paddingHorizontal: T.spacing.large,
    gap: T.spacing.medium,
  },
  dangerButton: {
    backgroundColor: T.color.red,
  },
})
