import { createSlice } from '@reduxjs/toolkit'
import { loadFeatureFlags } from '@/core/feature-flag/usecases/load-feature-flags.usecase'
import { DEFAULT_FEATURE_FLAGS, FeatureFlagValues } from '@/feature-flags'

type FeatureFlagState = {
  flags: FeatureFlagValues
}

const initialState: FeatureFlagState = {
  flags: DEFAULT_FEATURE_FLAGS,
}

export const featureFlagSlice = createSlice({
  name: 'featureFlag',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFeatureFlags.fulfilled, (state, action) => {
      state.flags = action.payload
    })
  },
})
