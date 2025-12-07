import { combineReducers } from '@reduxjs/toolkit'
import { reducer as authReducer } from '@/core/auth/reducer'
import { blockSessionSlice } from '../block-session/block-session.slice'
import { blocklistSlice } from '../blocklist/blocklist.slice'
import { sirenSlice } from '../siren/siren.slice'
import { strictModeSlice } from '../strictMode/strict-mode.slice'

export const rootReducer = combineReducers({
  blockSession: blockSessionSlice.reducer,
  blocklist: blocklistSlice.reducer,
  siren: sirenSlice.reducer,
  auth: authReducer,
  strictMode: strictModeSlice.reducer,
})
