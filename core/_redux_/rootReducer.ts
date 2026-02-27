import { combineReducers } from '@reduxjs/toolkit'
import { accessibilityConsentSlice } from '@/core/accessibility-consent/accessibility-consent.slice'
import { reducer as authReducer } from '@/core/auth/reducer'
import { featureFlagSlice } from '@/core/feature-flag/feature-flag.slice'
import { blockSessionSlice } from '../block-session/block-session.slice'
import { blocklistSlice } from '../blocklist/blocklist.slice'
import { deviceSlice } from '../device/device.slice'
import { sirenSlice } from '../siren/siren.slice'
import { strictModeSlice } from '../strict-mode/strict-mode.slice'
import { toastSlice } from '../toast/toast.slice'

export const rootReducer = combineReducers({
  accessibilityConsent: accessibilityConsentSlice.reducer,
  blockSession: blockSessionSlice.reducer,
  blocklist: blocklistSlice.reducer,
  device: deviceSlice.reducer,
  featureFlag: featureFlagSlice.reducer,
  siren: sirenSlice.reducer,
  auth: authReducer,
  strictMode: strictModeSlice.reducer,
  toast: toastSlice.reducer,
})
