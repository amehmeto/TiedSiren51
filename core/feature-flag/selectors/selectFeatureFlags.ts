import { RootState } from '@/core/_redux_/createStore'

export const selectFeatureFlags = (state: RootState) => state.featureFlag.flags
