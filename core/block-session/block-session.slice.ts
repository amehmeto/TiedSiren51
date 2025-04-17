import { createSlice } from '@reduxjs/toolkit'
import { createBlockSession } from './usecases/create-block-session.usecase'
import { blockSessionAdapter } from './block.session'
import { duplicateBlockSession } from './usecases/duplicate-block-session.usecase'
import { renameBlockSession } from './usecases/rename-block-session.usecase'
import { deleteBlockSession } from './usecases/delete-block-session.usecase'
import { updateBlockSession } from './usecases/update-block-session.usecase'
import { loadUser } from '../auth/usecases/load-user.usecase'

export const blockSessionSlice = createSlice({
  name: 'blockSession',
  initialState: blockSessionAdapter.getInitialState(),
  reducers: {
    setBlockSessions: (state, action) => {
      blockSessionAdapter.setAll(state, action.payload)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        blockSessionAdapter.setAll(state, action.payload.blockSessions)
      })
      .addCase(createBlockSession.fulfilled, (state, action) => {
        blockSessionAdapter.addOne(state, action.payload)
      })
      .addCase(updateBlockSession.fulfilled, (state, action) => {
        blockSessionAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        })
      })
      .addCase(renameBlockSession.fulfilled, (state, action) => {
        blockSessionAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { name: action.payload.name },
        })
      })
      .addCase(duplicateBlockSession.fulfilled, (state, action) => {
        blockSessionAdapter.addOne(state, action.payload)
      })
      .addCase(deleteBlockSession.fulfilled, (state, action) => {
        blockSessionAdapter.removeOne(state, action.payload)
      })
  },
})

// Export the action
export const { setBlockSessions } = blockSessionSlice.actions
export default blockSessionSlice.reducer
