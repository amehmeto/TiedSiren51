import { useEffect, useCallback } from 'react'
import { AppState, AppStateStatus, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsTimerActive } from '@/core/timer/selectors/selectIsTimerActive'
import { selectIsTimerLoading } from '@/core/timer/selectors/selectIsTimerLoading'
import { selectTimeRemaining } from '@/core/timer/selectors/selectTimeRemaining'
import { tickTimer } from '@/core/timer/timer.slice'
import { extendTimer } from '@/core/timer/usecases/extend-timer.usecase'
import { loadTimer } from '@/core/timer/usecases/load-timer.usecase'
import { startTimer } from '@/core/timer/usecases/start-timer.usecase'
import { dependencies } from '@/ui/dependencies'
import { handleUIError } from '@/ui/utils/handleUIError'

const UPDATE_INTERVAL_MS = 1000
const ALERT_TITLE = 'Error'

export const useStrictModeTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies
  const now = dateProvider.getNow().getTime()
  const timeRemaining = useSelector((state: RootState) =>
    selectTimeRemaining(state, now),
  )
  const isActive = useSelector((state: RootState) =>
    selectIsTimerActive(state, now),
  )
  const isLoading = useSelector(selectIsTimerLoading)

  const reportError = useCallback((error: unknown, context: string) => {
    const message = handleUIError(error, context)
    Alert.alert(ALERT_TITLE, message)
  }, [])

  const handleStartTimer = useCallback(
    async (days: number, hours: number, minutes: number) => {
      try {
        const now = dateProvider.getNow().getTime()
        await dispatch(startTimer({ days, hours, minutes, now })).unwrap()
      } catch (error) {
        reportError(error, 'Failed to start timer')
      }
    },
    [dispatch, reportError, dateProvider],
  )

  const handleExtendTimer = useCallback(
    async (
      additionalDays: number,
      additionalHours: number,
      additionalMinutes: number,
    ) => {
      try {
        const now = dateProvider.getNow().getTime()
        await dispatch(
          extendTimer({
            days: additionalDays,
            hours: additionalHours,
            minutes: additionalMinutes,
            now,
          }),
        ).unwrap()
      } catch (error) {
        reportError(error, 'Failed to extend timer')
      }
    },
    [dispatch, reportError, dateProvider],
  )

  useEffect(() => {
    const now = dateProvider.getNow().getTime()
    dispatch(loadTimer(now))
  }, [dispatch, dateProvider])

  useEffect(() => {
    if (!isActive) return

    const intervalId = setInterval(() => {
      const now = dateProvider.getNow().getTime()
      dispatch(tickTimer(now))
    }, UPDATE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [isActive, dispatch, dateProvider])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isComingToForeground = nextAppState === 'active'
      if (isComingToForeground) {
        const now = dateProvider.getNow().getTime()
        dispatch(loadTimer(now))
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [dispatch, dateProvider])

  return {
    timeRemaining,
    isActive,
    isLoading,
    startTimer: handleStartTimer,
    extendTimer: handleExtendTimer,
  }
}
