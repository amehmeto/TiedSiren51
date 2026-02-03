import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export const selectBlocklistById = (state: RootState, blocklistId: string) =>
  blocklistAdapter.getSelectors().selectById(state.blocklist, blocklistId)
