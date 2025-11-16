import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { CircularTimerDisplay } from '@/ui/design-system/components/shared/CircularTimerDisplay'
import { TimerPickerModal } from '@/ui/design-system/components/shared/TimerPickerModal'
import { T } from '@/ui/design-system/theme'
import { useStrictModeTimer } from '@/ui/hooks/useStrictModeTimer'

export default function StrictModeScreen() {
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const [showExtendPicker, setShowExtendPicker] = useState(false)

  const {
    timeRemaining,
    isActive,
    isLoading,
    startTimer,
    stopTimer,
    extendTimer,
  } = useStrictModeTimer()

  const handleStartTimer = async (
    days: number,
    hours: number,
    minutes: number,
  ) => {
    await startTimer(days, hours, minutes)
  }

  const handleExtendTimer = async (
    days: number,
    hours: number,
    minutes: number,
  ) => {
    await extendTimer(days, hours, minutes)
  }

  const handleStopTimer = async () => {
    await stopTimer()
  }

  if (isLoading) {
    return (
      <LinearGradient
        colors={[
          'rgba(12, 32, 122, 1)',
          'rgba(30, 41, 91, 1)',
          'rgba(20, 20, 40, 1)',
        ]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color={T.color.lightBlue} />
      </LinearGradient>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Strict Mode</Text>
        </View>

        <CircularTimerDisplay
          timeRemaining={timeRemaining}
          isActive={isActive}
        />

        <View style={styles.actionButtons}>
          {!isActive ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowTimerPicker(true)}
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 1)', 'rgba(37, 99, 235, 1)']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Start Timer</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowExtendPicker(true)}
              >
                <Text style={styles.secondaryButtonText}>Extend Timer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleStopTimer}
              >
                <Text style={styles.dangerButtonText}>Stop Timer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {isActive && (
          <View style={styles.advancedSection}>
            <Text style={styles.advancedTitle}>UNLOCK METHOD</Text>
            <View style={styles.unlockMethodCard}>
              <View style={styles.unlockMethodRow}>
                <View style={styles.unlockMethodLeft}>
                  <Text style={styles.unlockMethodIcon}>⏱️</Text>
                  <Text style={styles.unlockMethodLabel}>Timer</Text>
                </View>
                <Text style={styles.unlockMethodValue}>
                  {timeRemaining.days}d {timeRemaining.hours}h{' '}
                  {timeRemaining.minutes}m{timeRemaining.seconds}s
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <TimerPickerModal
        visible={showTimerPicker}
        onClose={() => setShowTimerPicker(false)}
        onSave={handleStartTimer}
        title="Set the timer"
      />

      <TimerPickerModal
        visible={showExtendPicker}
        onClose={() => setShowExtendPicker(false)}
        onSave={handleExtendTimer}
        title="Extend timer by"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: T.spacing.xx_large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: T.spacing.large,
    paddingHorizontal: T.spacing.large,
    position: 'relative',
  },
  headerTitle: {
    color: T.color.white,
    fontSize: T.font.size.xLarge,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  actionButtons: {
    paddingHorizontal: T.spacing.large,
    gap: T.spacing.medium,
  },
  primaryButton: {
    borderRadius: T.border.radius.extraRounded,
    overflow: 'hidden',
    shadowColor: T.color.lightBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
  },
  buttonText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: T.border.radius.extraRounded,
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: T.border.radius.extraRounded,
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  dangerButtonText: {
    color: 'rgba(239, 68, 68, 1)',
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  advancedSection: {
    paddingHorizontal: T.spacing.large,
    marginTop: T.spacing.xx_large,
  },
  advancedTitle: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    letterSpacing: 1,
  },
  unlockMethodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unlockMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unlockMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.medium,
  },
  unlockMethodIcon: {
    fontSize: 24,
  },
  unlockMethodLabel: {
    color: T.color.white,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
  },
  unlockMethodValue: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
  },
})
