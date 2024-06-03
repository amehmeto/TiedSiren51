import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export const selectBlocklistById = (blocklistId: string, state: RootState) =>
  blocklistAdapter.getSelectors().selectById(state.blocklist, blocklistId)
