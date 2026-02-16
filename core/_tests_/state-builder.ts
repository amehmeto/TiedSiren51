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

const initialState = rootReducer(undefined, { type: 'unknown' })

const withBlockSessions = createAction<BlockSession[]>('withBlockSession')
const withBlocklists = createAction<Blocklist[]>('withBlocklists')
const withAvailableSirens = createAction<Sirens>('withAvailableSirens')
const withAuthUser = createAction<AuthUser>('withAuthUser')
const withoutAuthUser = createAction<{}>('withoutAuthUser')
type AuthErrorPayload = {
  message: string
  errorType?: AuthErrorType
}
const withAuthError = createAction<AuthErrorPayload>('withAuthError')
const withAuthLoading = createAction<boolean>('withAuthLoading')
const withStrictModeEndedAt = createAction<ISODateString | null>(
  'withStrictModeEndedAt',
)
const withPasswordResetSent = createAction<boolean>('withPasswordResetSent')
const withEmail = createAction<string>('withEmail')
const withPassword = createAction<string>('withPassword')
const withLastReauthenticatedAt = createAction<ISODateString | null>(
  'withLastReauthenticatedAt',
)
const withReauthenticating = createAction<boolean>('withReauthenticating')
const withReauthError = createAction<string | null>('withReauthError')
const withDeletingAccount = createAction<boolean>('withDeletingAccount')
const withDeleteAccountError = createAction<string | null>(
  'withDeleteAccountError',
)
const withDeleteConfirmText = createAction<string>('withDeleteConfirmText')

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
    .addCase(withEmail, (state, action) => {
      state.auth.email = action.payload
    })
    .addCase(withPassword, (state, action) => {
      state.auth.password = action.payload
    })
    .addCase(withLastReauthenticatedAt, (state, action) => {
      state.auth.lastReauthenticatedAt = action.payload
    })
    .addCase(withReauthenticating, (state, action) => {
      state.auth.isReauthenticating = action.payload
    })
    .addCase(withReauthError, (state, action) => {
      state.auth.reauthError = action.payload
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
    withEmail: reduce(withEmail),
    withPassword: reduce(withPassword),
    withLastReauthenticatedAt: reduce(withLastReauthenticatedAt),
    withReauthenticating: reduce(withReauthenticating),
    withReauthError: reduce(withReauthError),
    withDeletingAccount: reduce(withDeletingAccount),
    withDeleteAccountError: reduce(withDeleteAccountError),
    withDeleteConfirmText: reduce(withDeleteConfirmText),
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
