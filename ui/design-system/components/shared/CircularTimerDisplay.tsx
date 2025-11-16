import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TimeRemaining } from '@/ui/hooks/useStrictModeTimer'

interface CircularTimerDisplayProps {
  timeRemaining: TimeRemaining
  isActive: boolean
}

export const CircularTimerDisplay: React.FC<CircularTimerDisplayProps> = ({
  timeRemaining,
  isActive,
}) => {
  const formatTime = () => {
    const { days, hours, minutes, seconds } = timeRemaining
    const parts = []

    if (days > 0) parts.push(`${days}d`)
    if (hours > 0 || days > 0) parts.push(`${hours}h`)
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`)
    parts.push(`${seconds}s`)

    return parts.join(' ')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime()}</Text>
      <Text style={styles.title}>
        until the timer ends: {timeRemaining.days}d {timeRemaining.hours}h{' '}
        {timeRemaining.minutes}m{timeRemaining.seconds}s
      </Text>

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
