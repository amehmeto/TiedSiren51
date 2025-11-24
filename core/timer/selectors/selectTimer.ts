import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'

export const selectTimer = createSelector(
  [(state: RootState) => state.timer],
  (timerState) => timerState.timer,
)
