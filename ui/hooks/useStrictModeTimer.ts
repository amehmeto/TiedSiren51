import { useEffect, useCallback, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsTimerActive } from '@/core/timer/selectors/selectIsTimerActive'
import { selectIsTimerLoading } from '@/core/timer/selectors/selectIsTimerLoading'
import { selectTimeLeft } from '@/core/timer/selectors/selectTimeLeft'
import { extendTimer } from '@/core/timer/usecases/extend-timer.usecase'
import { loadTimer } from '@/core/timer/usecases/load-timer.usecase'
import { startTimer } from '@/core/timer/usecases/start-timer.usecase'
import { dependencies } from '@/ui/dependencies'

const UPDATE_INTERVAL_MS = 1000

export const useStrictModeTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies
  const [now, setNow] = useState<Date>(dateProvider.getNow())
  const timeLeft = useSelector((state: RootState) =>
    selectTimeLeft(state, dateProvider),
  )
  const isActive = useSelector((state: RootState) =>
    selectIsTimerActive(state, dateProvider),
  )
  const isLoading = useSelector(selectIsTimerLoading)

  const handleStartTimer = useCallback(
    (days: number, hours: number, minutes: number) => {
      dispatch(startTimer({ days, hours, minutes }))
    },
    [dispatch],
  )

  const handleExtendTimer = useCallback(
    (
      additionalDays: number,
      additionalHours: number,
      additionalMinutes: number,
    ) => {
      dispatch(
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
    if (!isActive) return

    const intervalId = setInterval(() => {
      setNow(dateProvider.getNow())
    }, UPDATE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [isActive, dateProvider, now])

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
    timeLeft,
    isActive,
    isLoading,
    startTimer: handleStartTimer,
    extendTimer: handleExtendTimer,
  }
}
