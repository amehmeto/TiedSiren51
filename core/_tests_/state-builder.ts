import {
  BlockSession,
  blockSessionAdapter,
} from '../block-session/block.session'
import { RootState } from '../_redux_/createStore'
import {
  ActionCreatorWithPayload,
  createAction,
  createReducer,
} from '@reduxjs/toolkit'
import { rootReducer } from '../_redux_/rootReducer'
import { Blocklist, blocklistAdapter } from '../blocklist/blocklist'
import { Sirens } from '../siren/sirens'
import { AuthUser } from '@/core/auth/authUser'

const initialState = rootReducer(undefined, { type: 'unknown' })

const withBlockSessions = createAction<BlockSession[]>('withBlockSession')
const withBlocklists = createAction<Blocklist[]>('withBlocklists')
const withAvailableSirens = createAction<Sirens>('withAvailableSirens')
const withAuthUser = createAction<AuthUser>('withAuthUser')

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(withAuthUser, (state, action) => {
      state.auth.authUser = action.payload
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
    withBlockSessions: reduce(withBlockSessions),
    withBlocklists: reduce(withBlocklists),
    withAvailableSirens: reduce(withAvailableSirens),
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
