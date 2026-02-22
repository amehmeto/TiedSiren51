import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const loadAccessibilityConsent = createAppAsyncThunk<boolean>(
  'accessibilityConsent/load',
  async (_, { extra: { consentStorage } }) => {
    return consentStorage.hasConsented()
  },
)
