import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CircularTimerDisplay } from '@/ui/design-system/components/shared/CircularTimerDisplay'
import { LoadingScreen } from '@/ui/design-system/components/shared/LoadingScreen'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTitle } from '@/ui/design-system/components/shared/TiedSTitle'
import {
  TimerDuration,
  TimerPickerModal,
} from '@/ui/design-system/components/shared/TimerPickerModal'
import { T } from '@/ui/design-system/theme'
import { useStrictModeTimer } from '@/ui/hooks/useStrictModeTimer'
import { UnLockMethodCard } from '@ui/screens/StrictMode/UnLockMethodCard'

const DEFAULT_DURATION: TimerDuration = { days: 0, hours: 0, minutes: 20 }

export default function StrictModeScreen() {
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const [showExtendPicker, setShowExtendPicker] = useState(false)
  const [timerDuration, setTimerDuration] =
    useState<TimerDuration>(DEFAULT_DURATION)
  const [extendDuration, setExtendDuration] =
    useState<TimerDuration>(DEFAULT_DURATION)

  const { timeLeft, isActive, isLoading, startTimer, extendTimer } =
    useStrictModeTimer()

  if (isLoading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TiedSTitle text="Strict Mode" />

        <CircularTimerDisplay timeLeft={timeLeft} isActive={isActive} />

        <View style={styles.actionButtons}>
          {!isActive ? (
            <TiedSButton
              onPress={() => setShowTimerPicker(true)}
              text="Start Timer"
            />
          ) : (
            <TiedSButton
              onPress={() => setShowExtendPicker(true)}
              text="Extend Timer"
            />
          )}
        </View>

        {isActive && (
          <View style={styles.unlockSection}>
            <Text style={styles.sectionTitle}>{'UNLOCK METHOD'}</Text>
            <UnLockMethodCard timeLeft={timeLeft} />
          </View>
        )}
      </ScrollView>

      <TimerPickerModal
        visible={showTimerPicker}
        onClose={() => setShowTimerPicker(false)}
        onSave={() =>
          startTimer(
            timerDuration.days,
            timerDuration.hours,
            timerDuration.minutes,
          )
        }
        duration={timerDuration}
        onDurationChange={setTimerDuration}
        title={'Set the timer'}
      />

      <TimerPickerModal
        visible={showExtendPicker}
        onClose={() => setShowExtendPicker(false)}
        onSave={() =>
          extendTimer(
            extendDuration.days,
            extendDuration.hours,
            extendDuration.minutes,
          )
        }
        duration={extendDuration}
        onDurationChange={setExtendDuration}
        title={'Extend timer by'}
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

  actionButtons: {
    paddingHorizontal: T.spacing.large,
    gap: T.spacing.medium,
  },
  unlockSection: {
    paddingHorizontal: T.spacing.large,
    marginTop: T.spacing.xx_large,
  },
  sectionTitle: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    letterSpacing: T.font.letterSpacing.normal,
  },
})
