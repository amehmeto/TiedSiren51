import { useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectIsTimerLoading } from '@/core/timer/selectors/selectIsTimerLoading'
import { loadTimer } from '@/core/timer/usecases/load-timer.usecase'
import { dependencies } from '@/ui/dependencies'
import { useTick } from '@/ui/hooks/useTick'
import {
  selectStrictModeViewModel,
  StrictModeViewState,
} from '@/ui/screens/StrictMode/strictMode.view-model'
import { SECOND } from '@core/__constants__/time'

export const useStrictModeTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dateProvider } = dependencies
  const viewModel = useSelector((state: RootState) =>
    selectStrictModeViewModel(state, dateProvider),
  )
  const isActive = viewModel.type === StrictModeViewState.Active
  const isLoading = useSelector(selectIsTimerLoading)

  useTick(1 * SECOND, isActive)

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
    dispatch,
    viewModel,
    isActive,
    isLoading,
  }
}
