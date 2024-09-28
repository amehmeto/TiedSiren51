import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import {
  BlocklistViewModel,
  BlocklistViewModelType,
} from '@/core/blocklist/selectors/blocklist-view-model.type'

export const selectBlocklistViewModel = createSelector(
  [(rootState: RootState) => rootState.blocklist],
  (blocklist): BlocklistViewModelType => {
    const blocklists = blocklistAdapter.getSelectors().selectAll(blocklist)

    if (blocklists.length === 0) {
      return {
        type: BlocklistViewModel.NoBlocklist,
        message: 'Create your first blocklist to start planning block sessions',
      }
    }

    const formattedBlocklists = blocklists.map((blocklist) => {
      const totalBlocks = Object.values(blocklist.sirens).reduce(
        (acc, currentSiren) => acc + currentSiren.length,
        0,
      )

      return {
        id: blocklist.id,
        name: blocklist.name,
        totalBlocks: totalBlocks.toString() + ' blocks',
      }
    })

    return {
      type: BlocklistViewModel.WithBlockLists,
      blocklists: formattedBlocklists,
    }
  },
)
