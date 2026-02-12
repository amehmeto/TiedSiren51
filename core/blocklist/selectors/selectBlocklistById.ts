import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export function selectBlocklistById(
  state: RootState,
  blocklistId: string | undefined,
) {
  if (!blocklistId) return undefined
  return blocklistAdapter
    .getSelectors()
    .selectById(state.blocklist, blocklistId)
}
