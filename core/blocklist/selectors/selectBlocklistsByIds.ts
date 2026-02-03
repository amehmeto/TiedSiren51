import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export const selectBlocklistsByIds = (
  state: RootState,
  blocklistIds: string[],
) => {
  const entities = blocklistAdapter
    .getSelectors()
    .selectEntities(state.blocklist)
  return blocklistIds.flatMap((id) => (id in entities ? [entities[id]] : []))
}
