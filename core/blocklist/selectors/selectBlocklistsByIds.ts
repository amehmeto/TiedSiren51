import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export const selectBlocklistsByIds = (
  blocklistIds: string[],
  state: RootState,
) => {
  const entities = blocklistAdapter
    .getSelectors()
    .selectEntities(state.blocklist)
  return blocklistIds.flatMap((id) => (id in entities ? [entities[id]] : []))
}
