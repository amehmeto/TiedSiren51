import { useEffect, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import {
  selectIsTimerActive,
  selectIsTimerLoading,
  selectTimeRemaining,
} from '@/core/timer/selectors/timer.selectors'
import { tickTimer } from '@/core/timer/timer.slice'
import {
  loadTimer,
  startTimer,
  stopTimer,
  extendTimer,
} from '@/core/timer/usecases/timer.usecase'

const UPDATE_INTERVAL_MS = 1000

export const useStrictModeTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const timeRemaining = useSelector(selectTimeRemaining)
  const isActive = useSelector(selectIsTimerActive)
  const isLoading = useSelector(selectIsTimerLoading)

  const handleStartTimer = useCallback(
    async (days: number, hours: number, minutes: number) => {
      await dispatch(startTimer({ days, hours, minutes }))
    },
    [dispatch],
  )

  const handleStopTimer = useCallback(async () => {
    await dispatch(stopTimer())
  }, [dispatch])

  const handleExtendTimer = useCallback(
    async (
      additionalDays: number,
      additionalHours: number,
      additionalMinutes: number,
    ) => {
      await dispatch(
        extendTimer({
          days: additionalDays,
          hours: additionalHours,
          minutes: additionalMinutes,
        }),
      )
    },
    [dispatch],
  )

  useEffect(() => {
    dispatch(loadTimer())
  }, [dispatch])

  useEffect(() => {
    if (!isActive || timeRemaining.total > 0) return

    const checkAndStop = () => {
      if (timeRemaining.total <= 0) dispatch(stopTimer())
    }

    checkAndStop()
  }, [isActive, timeRemaining.total, dispatch])

  useEffect(() => {
    if (!isActive) return

    const intervalId = setInterval(() => {
      dispatch(tickTimer())

      if (timeRemaining.total <= 0) dispatch(stopTimer())
    }, UPDATE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [isActive, timeRemaining.total, dispatch])

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
