import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'

export const selectIsStrictModeLoading = createSelector(
  [(state: RootState) => state.strictMode],
  (strictModeState) => strictModeState.isLoading,
)
