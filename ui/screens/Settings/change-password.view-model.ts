import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectNeedsReauthentication } from '@/core/auth/selectors/selectNeedsReauthentication'

export function selectChangePasswordViewModel(
  state: RootState,
  dateProvider: DateProvider,
) {
  const {
    isChangingPassword,
    changePasswordError,
    hasChangePasswordSucceeded,
  } = state.auth

  return {
    isReauthenticated: !selectNeedsReauthentication(state, dateProvider),
    isChangingPassword,
    changePasswordError,
    hasChangePasswordSucceeded,
    buttonText: isChangingPassword ? 'Changing...' : 'Change Password',
  }
}
