import {
  ActionCreatorWithPayload,
  createAction,
  createReducer,
} from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AuthUser } from '@/core/auth/authUser'
import { RootState } from '../_redux_/createStore'
import { rootReducer } from '../_redux_/rootReducer'
import {
  BlockSession,
  blockSessionAdapter,
} from '../block-session/block.session'
import { Blocklist, blocklistAdapter } from '../blocklist/blocklist'
import { Sirens } from '../siren/sirens'

const initialState = rootReducer(undefined, { type: 'unknown' })

const withBlockSessions = createAction<BlockSession[]>('withBlockSession')
const withBlocklists = createAction<Blocklist[]>('withBlocklists')
const withAvailableSirens = createAction<Sirens>('withAvailableSirens')
const withAuthUser = createAction<AuthUser>('withAuthUser')
const withoutAuthUser = createAction<{}>('withoutAuthUser')
const withAuthError = createAction<string>('withAuthError')
const withAuthLoading = createAction<boolean>('withAuthLoading')
const withStrictModeEndedAt = createAction<ISODateString | null>(
  'withStrictModeEndedAt',
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
      state.auth.error = action.payload
    })
    .addCase(withAuthLoading, (state, action) => {
      state.auth.isLoading = action.payload
    })
    .addCase(withStrictModeEndedAt, (state, action) => {
      state.strictMode.endedAt = action.payload
    })
})

export const stateBuilder = (baseState = initialState) => {
  const reduce =
    <P>(actionCreator: ActionCreatorWithPayload<P>) =>
    (payload: P) =>
      stateBuilder(reducer(baseState, actionCreator(payload)))

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
