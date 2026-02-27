import { RootState } from '@/core/_redux_/createStore'

export const selectHasAccessibilityConsent = (state: RootState) =>
  state.accessibilityConsent.hasConsented
