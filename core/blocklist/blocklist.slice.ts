import { createSlice } from '@reduxjs/toolkit'
import { blocklistAdapter } from './blocklist'
import { createBlocklist } from './usecases/create-blocklist.usecase'
import { updateBlocklist } from './usecases/update-blocklist.usecase'
import { renameBlocklist } from './usecases/rename-blocklist.usecase'
import { duplicateBlocklist } from './usecases/duplicate-blocklist.usecase'
import { deleteBlocklist } from './usecases/delete-blocklist.usecase'
import { loadInitialData } from '../auth/usecases/load-initial-data.usecase'

export const blocklistSlice = createSlice({
  name: 'blocklist',
  initialState: blocklistAdapter.getInitialState(),
  reducers: {
    setBlocklists: (state, action) => {
      blocklistAdapter.setAll(state, action.payload)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadInitialData.fulfilled, (state, action) => {
        blocklistAdapter.setAll(state, action.payload.blocklists)
      })
      .addCase(createBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.addOne(state, action.payload)
      })
      .addCase(updateBlocklist.fulfilled, (state, action) => {
        blocklistAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        })
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
  },
})

export const { setBlocklists } = blocklistSlice.actions
