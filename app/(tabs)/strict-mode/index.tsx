import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CircularTimerDisplay } from '@/ui/design-system/components/shared/CircularTimerDisplay'
import { LoadingScreen } from '@/ui/design-system/components/shared/LoadingScreen'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTitle } from '@/ui/design-system/components/shared/TiedSTitle'
import { TimerPickerModal } from '@/ui/design-system/components/shared/TimerPickerModal'
import { T } from '@/ui/design-system/theme'
import { useStrictModeTimer } from '@/ui/hooks/useStrictModeTimer'
import { UnLockMethodCard } from '@ui/screens/StrictMode/UnLockMethodCard'

export default function StrictModeScreen() {
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const [showExtendPicker, setShowExtendPicker] = useState(false)

  const { timeRemaining, isActive, isLoading, startTimer, extendTimer } =
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

        <CircularTimerDisplay
          timeRemaining={timeRemaining}
          isActive={isActive}
        />

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
            <UnLockMethodCard timeRemaining={timeRemaining} />
          </View>
        )}
      </ScrollView>

      <TimerPickerModal
        visible={showTimerPicker}
        onClose={() => setShowTimerPicker(false)}
        onSave={startTimer}
        title={'Set the timer'}
      />

      <TimerPickerModal
        visible={showExtendPicker}
        onClose={() => setShowExtendPicker(false)}
        onSave={extendTimer}
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
