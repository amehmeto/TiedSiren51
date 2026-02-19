import { RootState } from '../../_redux_/createStore'
import { blockSessionAdapter } from '../block-session'

export const selectBlockSessionById = (
  state: RootState,
  sessionId: string | undefined,
) => {
  if (!sessionId) return undefined
  return blockSessionAdapter
    .getSelectors()
    .selectById(state.blockSession, sessionId)
}
