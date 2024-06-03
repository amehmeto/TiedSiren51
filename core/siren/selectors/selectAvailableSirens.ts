import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../_redux_/createStore'

export const selectAvailableSirens = createSelector(
  [(state: RootState) => state.siren],
  (sirens) => sirens.availableSirens,
)
