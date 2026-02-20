import { createSlice } from '@reduxjs/toolkit'
import { loadUser } from '../auth/usecases/load-user.usecase'
import { logOut } from '../auth/usecases/log-out.usecase'
import { blocklistAdapter } from './blocklist'
import { createBlocklist } from './usecases/create-blocklist.usecase'
import { deleteBlocklist } from './usecases/delete-blocklist.usecase'
import { duplicateBlocklist } from './usecases/duplicate-blocklist.usecase'
import { renameBlocklist } from './usecases/rename-blocklist.usecase'
import { updateBlocklist } from './usecases/update-blocklist.usecase'

type BlocklistExtraState = {
  saveError: string | null
}

export const blocklistSlice = createSlice({
  name: 'blocklist',
  initialState: blocklistAdapter.getInitialState<BlocklistExtraState>({
    saveError: null,
  }),
  reducers: {
    setBlocklists: (state, action) => {
      blocklistAdapter.setAll(state, action.payload)
    },
    clearBlocklistSaveError: (state) => {
      state.saveError = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        blocklistAdapter.setAll(state, action.payload.blocklists)
      })
      .addCase(createBlocklist.pending, (state) => {
        state.saveError = null
      })
      .addCase(createBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.addOne(state, action.payload)
      })
      .addCase(createBlocklist.rejected, (state, action) => {
        state.saveError = action.error.message ?? 'Failed to create blocklist'
      })
      .addCase(updateBlocklist.pending, (state) => {
        state.saveError = null
      })
      .addCase(updateBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        })
      })
      .addCase(updateBlocklist.rejected, (state, action) => {
        state.saveError = action.error.message ?? 'Failed to update blocklist'
      })
      .addCase(renameBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { name: action.payload.name },
        })
      })
      .addCase(duplicateBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.addOne(state, action.payload)
      })
      .addCase(deleteBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.removeOne(state, action.payload)
      })
      .addCase(logOut.fulfilled, (state) => {
        blocklistAdapter.removeAll(state)
      })
  },
})

export const { setBlocklists, clearBlocklistSaveError } = blocklistSlice.actions
