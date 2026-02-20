import { RootState } from '../../_redux_/createStore'

export const selectBlocklistSaveError = (state: RootState): string | null =>
  state.blocklist.saveError
