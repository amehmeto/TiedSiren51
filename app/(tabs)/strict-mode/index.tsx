import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { CircularTimerDisplay } from '@/ui/design-system/components/shared/CircularTimerDisplay'
import { StrictModeButtons } from '@/ui/design-system/components/shared/StrictModeButtons'
import { TimerPickerModal } from '@/ui/design-system/components/shared/TimerPickerModal'
import { UnlockMethodCard } from '@/ui/design-system/components/shared/UnlockMethodCard'
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
        colors={[T.color.darkBlue, T.color.darkBlueGray, T.color.darkBlue]}
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
          <Text style={styles.headerTitle}>{'Strict Mode'}</Text>
        </View>

        <CircularTimerDisplay
          timeRemaining={timeRemaining}
          isActive={isActive}
        />

        <StrictModeButtons
          isActive={isActive}
          onStartTimer={() => setShowTimerPicker(true)}
          onExtendTimer={() => setShowExtendPicker(true)}
          onStopTimer={handleStopTimer}
        />

        {isActive && <UnlockMethodCard timeRemaining={timeRemaining} />}
      </ScrollView>

      <TimerPickerModal
        visible={showTimerPicker}
        onClose={() => setShowTimerPicker(false)}
        onSave={handleStartTimer}
        title={'Set the timer'}
      />

      <TimerPickerModal
        visible={showExtendPicker}
        onClose={() => setShowExtendPicker(false)}
        onSave={handleExtendTimer}
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
})
