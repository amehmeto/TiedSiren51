import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { SECOND } from '@/core/__constants__/time'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsStrictModeLoading } from '@/core/strict-mode/selectors/selectIsStrictModeLoading'
import { extendTimer } from '@/core/strict-mode/usecases/extend-timer.usecase'
import { loadTimer } from '@/core/strict-mode/usecases/load-timer.usecase'
import { startTimer } from '@/core/strict-mode/usecases/start-timer.usecase'
import { dependencies } from '@/ui/dependencies'
import { CircularTimerDisplay } from '@/ui/design-system/components/shared/CircularTimerDisplay'
import { LoadingScreen } from '@/ui/design-system/components/shared/LoadingScreen'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTitle } from '@/ui/design-system/components/shared/TiedSTitle'
import {
  TimerDuration,
  TimerPickerModal,
} from '@/ui/design-system/components/shared/TimerPickerModal'
import { T } from '@/ui/design-system/theme'
import { useAppForeground } from '@/ui/hooks/useAppForeground'
import { useTick } from '@/ui/hooks/useTick'
import { formatDuration } from '@ui/screens/StrictMode/format-duration.helper'
import {
  selectStrictModeViewModel,
  StrictModeViewState,
} from '@ui/screens/StrictMode/strict-mode.view-model'
import { StrictModeConfirmationModal } from '@ui/screens/StrictMode/StrictModeConfirmationModal'
import { UnlockSection } from '@ui/screens/StrictMode/UnlockSection'

const DEFAULT_DURATION: TimerDuration = { days: 0, hours: 0, minutes: 20 }

export default function StrictModeScreen() {
  const [isShowingTimerPicker, setIsShowingTimerPicker] = useState(false)
  const [isShowingExtendPicker, setIsShowingExtendPicker] = useState(false)
  const [isShowingConfirmation, setIsShowingConfirmation] = useState(false)
  const [timerDuration, setTimerDuration] =
    useState<TimerDuration>(DEFAULT_DURATION)
  const [extendDuration, setExtendDuration] =
    useState<TimerDuration>(DEFAULT_DURATION)

  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies

  const viewModel = useSelector((state: RootState) =>
    selectStrictModeViewModel(state, dateProvider),
  )
  const isActive = viewModel.type === StrictModeViewState.Active
  const isLoading = useSelector(selectIsStrictModeLoading)

  useTick(1 * SECOND, isActive)

  useAppForeground(() => {
    dispatch(loadTimer())
  })

  const handleTimerPickerSave = () => {
    setIsShowingTimerPicker(false)
    setIsShowingConfirmation(true)
  }

  const handleConfirmStrictMode = () => {
    dispatch(
      startTimer({
        days: timerDuration.days,
        hours: timerDuration.hours,
        minutes: timerDuration.minutes,
      }),
    )
    setIsShowingConfirmation(false)
  }

  const formattedTimerDuration = formatDuration(timerDuration)

  if (isLoading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TiedSTitle text="Strict Mode" />

        <CircularTimerDisplay viewModel={viewModel} />

        <View style={styles.actionButtons}>
          <TiedSButton
            onPress={() =>
              isActive
                ? setIsShowingExtendPicker(true)
                : setIsShowingTimerPicker(true)
            }
            text={viewModel.buttonText}
          />
        </View>

        {viewModel.type === StrictModeViewState.Active && (
          <UnlockSection inlineRemaining={viewModel.inlineRemaining} />
        )}
      </ScrollView>

      <TimerPickerModal
        visible={isShowingTimerPicker}
        onClose={() => setIsShowingTimerPicker(false)}
        onSave={handleTimerPickerSave}
        duration={timerDuration}
        onDurationChange={setTimerDuration}
        title={'Set the timer'}
      />

      <TimerPickerModal
        visible={isShowingExtendPicker}
        onClose={() => setIsShowingExtendPicker(false)}
        onSave={() =>
          dispatch(
            extendTimer({
              days: extendDuration.days,
              hours: extendDuration.hours,
              minutes: extendDuration.minutes,
            }),
          )
        }
        duration={extendDuration}
        onDurationChange={setExtendDuration}
        title={'Extend timer by'}
      />

      <StrictModeConfirmationModal
        isVisible={isShowingConfirmation}
        formattedDuration={formattedTimerDuration}
        onRequestClose={() => setIsShowingConfirmation(false)}
        onCancel={() => setIsShowingConfirmation(false)}
        onConfirm={handleConfirmStrictMode}
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
})
