import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/port.date-provider'
import { extendTimer } from './usecases/extend-timer.usecase'
import { loadTimer } from './usecases/load-timer.usecase'
import { startTimer } from './usecases/start-timer.usecase'

type TimerState = {
  endAt: ISODateString | null
  isLoading: boolean
}

const initialState: TimerState = {
  endAt: null,
  isLoading: true,
}

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setEndAt: (state, action: PayloadAction<ISODateString | null>) => {
      state.endAt = action.payload
      state.isLoading = false
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadTimer.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadTimer.fulfilled, (state, action) => {
        state.endAt = action.payload
        state.isLoading = false
      })
      .addCase(loadTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.endAt = action.payload
      })
      .addCase(startTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(extendTimer.fulfilled, (state, action) => {
        state.endAt = action.payload
      })
      .addCase(extendTimer.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { setEndAt } = timerSlice.actions
