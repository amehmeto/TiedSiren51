import { RootState } from '@/core/_redux_/createStore'

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
): DeleteAccountViewModel {
  const {
    authUser,
    isDeletingAccount,
    deleteAccountError,
    deleteConfirmText,
    lastReauthenticatedAt,
  } = state.auth

  if (!authUser) {
    return {
      type: DeleteAccountViewState.Deleted,
    }
  }

  const isConfirmed = deleteConfirmText === DELETE_CONFIRMATION

  return {
    type: DeleteAccountViewState.Form,
    isReauthenticated: lastReauthenticatedAt !== null,
    isDeletingAccount,
    deleteAccountError,
    confirmText: deleteConfirmText,
    isConfirmed,
    buttonText: isDeletingAccount ? 'Deleting...' : 'Delete My Account',
    isDeleteDisabled: !isConfirmed || isDeletingAccount,
  }
}
