import { RootState } from '../../_redux_/createStore'
import { blockSessionAdapter } from '../block-session'

export const selectBlockSessionById = (state: RootState, sessionId: string) =>
  blockSessionAdapter.getSelectors().selectById(state.blockSession, sessionId)
