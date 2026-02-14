import { RootState } from '@/core/_redux_/createStore'

export enum DeleteAccountViewState {
  Form = 'FORM',
  Deleted = 'DELETED',
}

type FormViewModel = {
  type: DeleteAccountViewState.Form
  isDeletingAccount: boolean
  deleteAccountError: string | null
}

type DeletedViewModel = {
  type: DeleteAccountViewState.Deleted
}

export type DeleteAccountViewModel = FormViewModel | DeletedViewModel

export function selectDeleteAccountViewModel(
  state: RootState,
): DeleteAccountViewModel {
  const { authUser, isDeletingAccount, deleteAccountError } = state.auth

  if (!authUser) {
    return {
      type: DeleteAccountViewState.Deleted,
    }
  }

  return {
    type: DeleteAccountViewState.Form,
    isDeletingAccount,
    deleteAccountError,
  }
}
