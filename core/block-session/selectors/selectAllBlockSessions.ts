import { RootState } from '@/core/_redux_/createStore'
import { blockSessionAdapter } from '../block-session'

export const selectAllBlockSessions = (state: RootState) =>
  blockSessionAdapter.getSelectors().selectAll(state.blockSession)
