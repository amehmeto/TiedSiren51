import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/date-provider'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { extendTimer } from './usecases/extend-timer.usecase'
import { loadTimer } from './usecases/load-timer.usecase'
import { startTimer } from './usecases/start-timer.usecase'

type StrictModeState = {
  endedAt: ISODateString | null
  isLoading: boolean
}

const initialState: StrictModeState = {
  endedAt: null,
  isLoading: true,
}

export const strictModeSlice = createSlice({
  name: 'strictMode',
  initialState,
  reducers: {
    setEndedAt: (state, action: PayloadAction<ISODateString | null>) => {
      state.endedAt = action.payload
      state.isLoading = false
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadTimer.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadTimer.fulfilled, (state, action) => {
        state.endedAt = action.payload
        state.isLoading = false
      })
      .addCase(loadTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.endedAt = action.payload
      })
      .addCase(startTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(extendTimer.fulfilled, (state, action) => {
        state.endedAt = action.payload
      })
      .addCase(extendTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(logOut.fulfilled, () => initialState)
  },
})

export const { setEndedAt } = strictModeSlice.actions
