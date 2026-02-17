import {
  ActionCreatorWithPayload,
  createAction,
  createReducer,
} from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { AuthUser } from '@/core/auth/auth-user'
import { RootState } from '../_redux_/createStore'
import { rootReducer } from '../_redux_/rootReducer'
import {
  BlockSession,
  blockSessionAdapter,
} from '../block-session/block-session'
import { Blocklist, blocklistAdapter } from '../blocklist/blocklist'
import { Sirens } from '../siren/sirens'

type AuthErrorPayload = {
  message: string
  errorType?: AuthErrorType
}

const initialState = rootReducer(undefined, { type: 'unknown' })

const withBlockSessions = createAction<BlockSession[]>('withBlockSession')
const withBlocklists = createAction<Blocklist[]>('withBlocklists')
const withAvailableSirens = createAction<Sirens>('withAvailableSirens')
const withAuthUser = createAction<AuthUser>('withAuthUser')
const withoutAuthUser = createAction<{}>('withoutAuthUser')
const withAuthError = createAction<AuthErrorPayload>('withAuthError')
const withAuthLoading = createAction<boolean>('withAuthLoading')
const withStrictModeEndedAt = createAction<ISODateString | null>(
  'withStrictModeEndedAt',
)
const withPasswordResetSent = createAction<boolean>('withPasswordResetSent')
const withLastReauthenticatedAt = createAction<ISODateString | null>(
  'withLastReauthenticatedAt',
)
const withSendingVerificationEmail = createAction<boolean>(
  'withSendingVerificationEmail',
)
const withVerificationEmailSent = createAction<boolean>(
  'withVerificationEmailSent',
)
const withRefreshingEmailVerification = createAction<boolean>(
  'withRefreshingEmailVerification',
)
const withReauthenticating = createAction<boolean>('withReauthenticating')
const withReauthError = createAction<string | null>('withReauthError')
const withEmail = createAction<string>('withEmail')
const withPassword = createAction<string>('withPassword')
const withDeletingAccount = createAction<boolean>('withDeletingAccount')
const withDeleteAccountError = createAction<string | null>(
  'withDeleteAccountError',
)
const withDeleteConfirmText = createAction<string>('withDeleteConfirmText')
const withChangingPassword = createAction<boolean>('withChangingPassword')
const withChangePasswordError = createAction<string | null>(
  'withChangePasswordError',
)
const withHasChangePasswordSucceeded = createAction<boolean>(
  'withHasChangePasswordSucceeded',
)
const withChangePasswordSuccessCount = createAction<number>(
  'withChangePasswordSuccessCount',
)

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(withAuthUser, (state, action) => {
      state.auth.authUser = action.payload
    })
    .addCase(withoutAuthUser, (state) => {
      state.auth.authUser = null
    })
    .addCase(withBlockSessions, (state, action) => {
      blockSessionAdapter.addMany(state.blockSession, action.payload)
    })
    .addCase(withBlocklists, (state, action) => {
      blocklistAdapter.addMany(state.blocklist, action.payload)
    })
    .addCase(withAvailableSirens, (state, action) => {
      state.siren.availableSirens = action.payload
    })
    .addCase(withAuthError, (state, action) => {
      state.auth.error = action.payload.message
      state.auth.errorType = action.payload.errorType ?? null
    })
    .addCase(withAuthLoading, (state, action) => {
      state.auth.isLoading = action.payload
    })
    .addCase(withStrictModeEndedAt, (state, action) => {
      state.strictMode.endedAt = action.payload
    })
    .addCase(withPasswordResetSent, (state, action) => {
      state.auth.isPasswordResetSent = action.payload
    })
    .addCase(withLastReauthenticatedAt, (state, action) => {
      state.auth.lastReauthenticatedAt = action.payload
    })
    .addCase(withSendingVerificationEmail, (state, action) => {
      state.auth.isSendingVerificationEmail = action.payload
    })
    .addCase(withVerificationEmailSent, (state, action) => {
      state.auth.isVerificationEmailSent = action.payload
    })
    .addCase(withRefreshingEmailVerification, (state, action) => {
      state.auth.isRefreshingEmailVerification = action.payload
    })
    .addCase(withReauthenticating, (state, action) => {
      state.auth.isReauthenticating = action.payload
    })
    .addCase(withReauthError, (state, action) => {
      state.auth.reauthError = action.payload
    })
    .addCase(withEmail, (state, action) => {
      state.auth.email = action.payload
    })
    .addCase(withPassword, (state, action) => {
      state.auth.password = action.payload
    })
    .addCase(withDeletingAccount, (state, action) => {
      state.auth.isDeletingAccount = action.payload
    })
    .addCase(withDeleteAccountError, (state, action) => {
      state.auth.deleteAccountError = action.payload
    })
    .addCase(withDeleteConfirmText, (state, action) => {
      state.auth.deleteConfirmText = action.payload
    })
    .addCase(withChangingPassword, (state, action) => {
      state.auth.isChangingPassword = action.payload
    })
    .addCase(withChangePasswordError, (state, action) => {
      state.auth.changePasswordError = action.payload
    })
    .addCase(withHasChangePasswordSucceeded, (state, action) => {
      state.auth.hasChangePasswordSucceeded = action.payload
    })
    .addCase(withChangePasswordSuccessCount, (state, action) => {
      state.auth.changePasswordSuccessCount = action.payload
    })
})

export const stateBuilder = (baseState = initialState) => {
  const reduce =
    <P>(actionCreator: ActionCreatorWithPayload<P>) =>
    (payload: P) => {
      const nextState = reducer(baseState, actionCreator(payload))
      return stateBuilder(nextState)
    }

  return {
    build(): RootState {
      return baseState
    },
    withAuthUser: reduce(withAuthUser),
    withoutAuthUser: reduce(withoutAuthUser),
    withBlockSessions: reduce(withBlockSessions),
    withBlocklists: reduce(withBlocklists),
    withAvailableSirens: reduce(withAvailableSirens),
    withAuthError: reduce(withAuthError),
    withAuthLoading: reduce(withAuthLoading),
    withStrictModeEndedAt: reduce(withStrictModeEndedAt),
    withPasswordResetSent: reduce(withPasswordResetSent),
    withSendingVerificationEmail: reduce(withSendingVerificationEmail),
    withVerificationEmailSent: reduce(withVerificationEmailSent),
    withRefreshingEmailVerification: reduce(withRefreshingEmailVerification),
    withEmail: reduce(withEmail),
    withPassword: reduce(withPassword),
    withLastReauthenticatedAt: reduce(withLastReauthenticatedAt),
    withReauthenticating: reduce(withReauthenticating),
    withReauthError: reduce(withReauthError),
    withDeletingAccount: reduce(withDeletingAccount),
    withDeleteAccountError: reduce(withDeleteAccountError),
    withDeleteConfirmText: reduce(withDeleteConfirmText),
    withChangingPassword: reduce(withChangingPassword),
    withChangePasswordError: reduce(withChangePasswordError),
    withHasChangePasswordSucceeded: reduce(withHasChangePasswordSucceeded),
    withChangePasswordSuccessCount: reduce(withChangePasswordSuccessCount),
  }
}

export const stateBuilderProvider = () => {
  let builder = stateBuilder()

  return {
    getState() {
      return builder.build()
    },
    setState(updateFn: (_builder: StateBuilder) => StateBuilder) {
      builder = updateFn(builder)
    },
  }
}

export type StateBuilder = ReturnType<typeof stateBuilder>
export type StateBuilderProvider = ReturnType<typeof stateBuilderProvider>
