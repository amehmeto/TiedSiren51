import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { TimeRemaining } from '../timer'
import { millisecondsToTimeUnits } from '../timer.utils'
import { selectTimer } from './selectTimer'

const EMPTY_TIME: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
}

export const selectTimeRemaining = createSelector(
  [
    selectTimer,
    (state: RootState) => state.timer.lastUpdate,
    (_state: RootState, now: number) => now,
  ],
  (timer, _lastUpdate, now): TimeRemaining => {
    if (!timer?.isActive) return EMPTY_TIME

    const difference = timer.endTime - now

    if (difference <= 0) return EMPTY_TIME

    const timeUnits = millisecondsToTimeUnits(difference)
    return { ...timeUnits, total: difference }
  },
)
