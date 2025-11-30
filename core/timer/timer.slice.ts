import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/port.date-provider'
import { extendTimer } from './usecases/extend-timer.usecase'
import { loadTimer } from './usecases/load-timer.usecase'
import { startTimer } from './usecases/start-timer.usecase'

type TimerState = {
  endedAt: ISODateString | null
  isLoading: boolean
}

const initialState: TimerState = {
  endedAt: null,
  isLoading: true,
}

export const timerSlice = createSlice({
  name: 'timer',
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
  },
})

export const { setEndedAt } = timerSlice.actions
