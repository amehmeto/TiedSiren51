import { createSelector } from '@reduxjs/toolkit'
import { selectTimer } from './selectTimer'

export const selectIsTimerActive = createSelector(
  [selectTimer],
  (timer) => timer?.isActive ?? false,
)
