import { combineReducers } from '@reduxjs/toolkit'
import { reducer as authReducer } from '@/core/auth/reducer'
import { blockSessionSlice } from '../block-session/block-session.slice'
import { blocklistSlice } from '../blocklist/blocklist.slice'
import { sirenSlice } from '../siren/siren.slice'
import { timerSlice } from '../timer/timer.slice'

export const rootReducer = combineReducers({
  blockSession: blockSessionSlice.reducer,
  blocklist: blocklistSlice.reducer,
  siren: sirenSlice.reducer,
  auth: authReducer,
  timer: timerSlice.reducer,
})
