import { blocklistAdapter } from '../blocklist'
import { RootState } from '../../_redux_/createStore'
import { createSelector } from '@reduxjs/toolkit'

export const selectAllBlocklists = createSelector(
  [(state: RootState) => state.blocklist],
  (blocklists) => blocklistAdapter.getSelectors().selectAll(blocklists),
)
