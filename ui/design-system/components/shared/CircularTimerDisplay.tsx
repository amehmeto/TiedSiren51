import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TimeRemaining } from '@/core/timer/timer'
import { T } from '@/ui/design-system/theme'
import { formatCountdown, formatEndFromOffsets } from '@/ui/utils/timeFormat'

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
          size={T.icon.size.xLarge}
          color={T.color.lightBlue}
        />
      )}
      <Text style={styles.timerText}>{formatCountdown(timeRemaining)}</Text>
      {shouldShowInline && (
        <Text style={styles.title}>
          {formatEndFromOffsets({
            days: timeRemaining.days,
            hours: timeRemaining.hours,
            minutes: timeRemaining.minutes,
          })}
        </Text>
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
    fontSize: T.font.size.xxLarge,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    letterSpacing: T.font.letterSpacing.normal,
  },
  statusMessage: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginTop: T.spacing.large,
    lineHeight: T.font.size.large,
    fontFamily: T.font.family.primary,
    paddingHorizontal: T.spacing.xx_large,
  },
})
