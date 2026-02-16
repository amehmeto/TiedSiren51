import { RootState } from '@/core/_redux_/createStore'

export const selectEmailVerificationStatus = (state: RootState) => ({
  isEmailVerified: state.auth.authUser?.isEmailVerified ?? false,
  isVerificationEmailSent: state.auth.isVerificationEmailSent,
  isRefreshingEmailVerification: state.auth.isRefreshingEmailVerification,
})
