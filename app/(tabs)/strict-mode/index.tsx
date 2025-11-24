import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CircularTimerDisplay } from '@/ui/design-system/components/shared/CircularTimerDisplay'
import { LoadingScreen } from '@/ui/design-system/components/shared/LoadingScreen'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TimerPickerModal } from '@/ui/design-system/components/shared/TimerPickerModal'
import { UnlockMethodCard } from '@/ui/design-system/components/shared/UnlockMethodCard'
import { T } from '@/ui/design-system/theme'
import { useStrictModeTimer } from '@/ui/hooks/useStrictModeTimer'

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{'Strict Mode'}</Text>
        </View>

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

        {isActive && <UnlockMethodCard timeRemaining={timeRemaining} />}
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
})
