import { createSlice } from '@reduxjs/toolkit'
import { giveAccessibilityConsent } from '@/core/accessibility-consent/usecases/give-accessibility-consent.usecase'
import { loadAccessibilityConsent } from '@/core/accessibility-consent/usecases/load-accessibility-consent.usecase'

type AccessibilityConsentState = {
  hasConsented: boolean | null
}

const initialState: AccessibilityConsentState = {
  hasConsented: null,
}

export const accessibilityConsentSlice = createSlice({
  name: 'accessibilityConsent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadAccessibilityConsent.fulfilled, (state, action) => {
      state.hasConsented = action.payload
    })
    builder.addCase(giveAccessibilityConsent.fulfilled, (state) => {
      state.hasConsented = true
    })
  },
})
