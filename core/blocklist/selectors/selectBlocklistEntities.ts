import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export const selectBlocklistEntities = createSelector(
  [(state: RootState) => state.blocklist],
  (blocklists) => blocklistAdapter.getSelectors().selectEntities(blocklists),
)
