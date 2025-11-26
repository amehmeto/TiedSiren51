import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { selectTimer } from './selectTimer'

export const selectIsTimerActive = createSelector(
  [selectTimer, (_state: RootState, now: number) => now],
  (timer, now) => {
    if (!timer) return false
    return timer.endAt > now
  },
)
