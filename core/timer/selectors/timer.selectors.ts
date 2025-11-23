import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { TimeRemaining } from '../timer'
import { millisecondsToTimeUnits } from '../timer.utils'

const EMPTY_TIME: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
}

export const selectTimer = createSelector(
  [(state: RootState) => state.timer],
  (timerState) => timerState.timer,
)

export const selectIsTimerActive = createSelector(
  [(state: RootState) => state.timer.timer],
  (timer) => timer?.isActive ?? false,
)

export const selectIsTimerLoading = createSelector(
  [(state: RootState) => state.timer],
  (timerState) => timerState.isLoading,
)

export const selectTimeRemaining = createSelector(
  [
    (state: RootState) => state.timer.timer,
    (state: RootState) => state.timer.lastUpdate,
  ],
  (timer): TimeRemaining => {
    if (!timer?.isActive) return EMPTY_TIME

    const now = Date.now()
    const difference = timer.endTime - now

    if (difference <= 0) return EMPTY_TIME

    const timeUnits = millisecondsToTimeUnits(difference)
    return { ...timeUnits, total: difference }
  },
)
