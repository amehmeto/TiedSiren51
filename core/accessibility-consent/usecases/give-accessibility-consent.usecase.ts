import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const giveAccessibilityConsent = createAppAsyncThunk<void>(
  'accessibilityConsent/give',
  async (_, { extra: { consentRepository } }) => {
    await consentRepository.giveConsent()
  },
)
