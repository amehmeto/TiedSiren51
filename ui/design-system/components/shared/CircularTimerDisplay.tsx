import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TimeRemaining } from '@/ui/hooks/useStrictModeTimer'
import { formatCountdown, formatInlineRemaining } from '@/ui/utils/timeFormat'

type CircularTimerDisplayProps = {
  timeRemaining: TimeRemaining
  isActive: boolean
}

export const CircularTimerDisplay = ({
  timeRemaining,
  isActive,
}: Readonly<CircularTimerDisplayProps>) => {
  const shouldShowInline = isActive && timeRemaining.total > 0

  return (
    <View style={styles.container}>
      {isActive && (
        <Ionicons
          name="lock-closed-outline"
          size={28}
          color={T.color.lightBlue}
        />
      )}
      <Text style={styles.timerText}>{formatCountdown(timeRemaining)}</Text>
      {shouldShowInline && (
        <Text style={styles.title}>{formatInlineRemaining(timeRemaining)}</Text>
      )}

      <Text style={styles.statusMessage}>
        {isActive
          ? 'Your blockings are locked against any\nbypassing.'
          : 'Set a timer to activate strict mode'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: T.spacing.xx_large,
  },
  title: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    marginBottom: T.spacing.small,
    fontFamily: T.font.family.primary,
  },
  timerText: {
    color: T.color.white,
    fontSize: 40,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    letterSpacing: 1,
  },
  statusMessage: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginTop: T.spacing.large,
    lineHeight: 24,
    fontFamily: T.font.family.primary,
    paddingHorizontal: T.spacing.xx_large,
  },
})
