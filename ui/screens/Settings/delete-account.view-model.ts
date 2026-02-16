import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectNeedsReauthentication } from '@/core/auth/selectors/selectNeedsReauthentication'

const DELETE_CONFIRMATION = 'DELETE'

export enum DeleteAccountViewState {
  Form = 'FORM',
  Deleted = 'DELETED',
}

type FormViewModel = {
  type: DeleteAccountViewState.Form
  isReauthenticated: boolean
  isDeletingAccount: boolean
  deleteAccountError: string | null
  confirmText: string
  isConfirmed: boolean
  buttonText: string
  isDeleteDisabled: boolean
}

type DeletedViewModel = {
  type: DeleteAccountViewState.Deleted
}

export type DeleteAccountViewModel = FormViewModel | DeletedViewModel

export function selectDeleteAccountViewModel(
  state: RootState,
  dateProvider: DateProvider,
): DeleteAccountViewModel {
  const { authUser, isDeletingAccount, deleteAccountError, deleteConfirmText } =
    state.auth

  if (!authUser) {
    return {
      type: DeleteAccountViewState.Deleted,
    }
  }

  const isConfirmed = deleteConfirmText === DELETE_CONFIRMATION

  return {
    type: DeleteAccountViewState.Form,
    isReauthenticated: !selectNeedsReauthentication(state, dateProvider),
    isDeletingAccount,
    deleteAccountError,
    confirmText: deleteConfirmText,
    isConfirmed,
    buttonText: isDeletingAccount ? 'Deleting...' : 'Delete My Account',
    isDeleteDisabled: !isConfirmed || isDeletingAccount,
  }
}
