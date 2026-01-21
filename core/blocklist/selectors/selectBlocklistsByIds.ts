import { RootState } from '../../_redux_/createStore'
import { selectBlocklistEntities } from './selectBlocklistEntities'

export const selectBlocklistsByIds = (
  blocklistIds: string[],
  state: RootState,
) => {
  const entities = selectBlocklistEntities(state)
  return blocklistIds.flatMap((id) => (id in entities ? [entities[id]] : []))
}
