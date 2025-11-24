import { useEffect, useCallback } from 'react'
import { AppState, AppStateStatus, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectIsTimerActive } from '@/core/timer/selectors/selectIsTimerActive'
import { selectIsTimerLoading } from '@/core/timer/selectors/selectIsTimerLoading'
import { selectTimeRemaining } from '@/core/timer/selectors/selectTimeRemaining'
import { tickTimer } from '@/core/timer/timer.slice'
import { extendTimer } from '@/core/timer/usecases/extend-timer.usecase'
import { loadTimer } from '@/core/timer/usecases/load-timer.usecase'
import { startTimer } from '@/core/timer/usecases/start-timer.usecase'
import { stopTimer } from '@/core/timer/usecases/stop-timer.usecase'
import { handleUIError } from '@/ui/utils/handleUIError'

const UPDATE_INTERVAL_MS = 1000
const ALERT_TITLE = 'Error'

export const useStrictModeTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const timeRemaining = useSelector(selectTimeRemaining)
  const isActive = useSelector(selectIsTimerActive)
  const isLoading = useSelector(selectIsTimerLoading)

  const reportError = useCallback((error: unknown, context: string) => {
    const message = handleUIError(error, context)
    Alert.alert(ALERT_TITLE, message)
  }, [])

  const handleStartTimer = useCallback(
    async (days: number, hours: number, minutes: number) => {
      try {
        await dispatch(startTimer({ days, hours, minutes })).unwrap()
      } catch (error) {
        reportError(error, 'Failed to start timer')
      }
    },
    [dispatch, reportError],
  )

  const handleStopTimer = useCallback(async () => {
    try {
      await dispatch(stopTimer()).unwrap()
    } catch (error) {
      reportError(error, 'Failed to stop timer')
    }
  }, [dispatch, reportError])

  const handleExtendTimer = useCallback(
    async (
      additionalDays: number,
      additionalHours: number,
      additionalMinutes: number,
    ) => {
      try {
        await dispatch(
          extendTimer({
            days: additionalDays,
            hours: additionalHours,
            minutes: additionalMinutes,
          }),
        ).unwrap()
      } catch (error) {
        reportError(error, 'Failed to extend timer')
      }
    },
    [dispatch, reportError],
  )

  useEffect(() => {
    dispatch(loadTimer())
  }, [dispatch])

  useEffect(() => {
    if (!isActive) return

    const intervalId = setInterval(() => {
      dispatch(tickTimer())
    }, UPDATE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [isActive, dispatch])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isComingToForeground = nextAppState === 'active'
      if (isComingToForeground) dispatch(loadTimer())
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [dispatch])

  return {
    timeRemaining,
    isActive,
    isLoading,
    startTimer: handleStartTimer,
    stopTimer: handleStopTimer,
    extendTimer: handleExtendTimer,
  }
}
