import { useEffect, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsTimerLoading } from '@/core/timer/selectors/selectIsTimerLoading'
import { extendTimer } from '@/core/timer/usecases/extend-timer.usecase'
import { loadTimer } from '@/core/timer/usecases/load-timer.usecase'
import { startTimer } from '@/core/timer/usecases/start-timer.usecase'
import { dependencies } from '@/ui/dependencies'
import { useTick } from '@/ui/hooks/useTick'
import {
  selectStrictModeViewModel,
  StrictModeViewState,
} from '@/ui/screens/StrictMode/strictMode.view-model'

export const useStrictModeTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies
  const viewModel = useSelector((state: RootState) =>
    selectStrictModeViewModel(state, dateProvider),
  )
  const isActive = viewModel.type === StrictModeViewState.Active
  const isLoading = useSelector(selectIsTimerLoading)

  // Trigger re-renders every second when timer is active
  useTick(1000, isActive)

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
    viewModel,
    isActive,
    isLoading,
    startTimer: handleStartTimer,
    extendTimer: handleExtendTimer,
  }
}
