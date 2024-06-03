import { RootState } from '../../_redux_/createStore'
import { blockSessionAdapter } from '../block.session'

export const selectBlockSessionById = (sessionId: string, state: RootState) =>
  blockSessionAdapter.getSelectors().selectById(state.blockSession, sessionId)
