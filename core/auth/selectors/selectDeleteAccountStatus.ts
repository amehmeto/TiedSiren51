import { RootState } from '@/core/_redux_/createStore'

export function selectDeleteAccountStatus(state: RootState) {
  const { isDeletingAccount, deleteAccountError } = state.auth
  return { isDeletingAccount, deleteAccountError }
}
