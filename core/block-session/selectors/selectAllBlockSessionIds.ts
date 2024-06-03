import { RootState } from '../../_redux_/createStore'
import { blockSessionAdapter } from '../block.session'

export const selectAllBlockSessionIds = (state: RootState) =>
  blockSessionAdapter.getSelectors().selectIds(state.blockSession)
