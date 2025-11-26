import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Timer } from './timer'
import { extendTimer } from './usecases/extend-timer.usecase'
import { loadTimer } from './usecases/load-timer.usecase'
import { startTimer } from './usecases/start-timer.usecase'
import { stopTimer } from './usecases/stop-timer.usecase'

type TimerState = {
  timer: Timer | null
  isLoading: boolean
  lastUpdate: number
}

const initialState: TimerState = {
  timer: null,
  isLoading: true,
  lastUpdate: 0,
}

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setTimer: (
      state,
      action: PayloadAction<{ timer: Timer | null; now: number }>,
    ) => {
      state.timer = action.payload.timer
      state.isLoading = false
      state.lastUpdate = action.payload.now
    },
    clearTimer: (state) => {
      state.timer = null
    },
    tickTimer: (state, action: PayloadAction<number>) => {
      state.lastUpdate = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadTimer.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadTimer.fulfilled, (state, action) => {
        const now = action.meta.arg
        const loadedTimer = action.payload

        if (loadedTimer && loadedTimer.endAt <= now) state.timer = null
        else state.timer = loadedTimer

        state.isLoading = false
        state.lastUpdate = now
      })
      .addCase(loadTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.timer = action.payload
        state.lastUpdate = action.meta.arg.now
      })
      .addCase(startTimer.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(stopTimer.fulfilled, (state) => {
        state.timer = null
      })
      .addCase(extendTimer.fulfilled, (state, action) => {
        state.timer = action.payload
        state.lastUpdate = action.meta.arg.now
      })
      .addCase(extendTimer.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { setTimer, clearTimer, tickTimer } = timerSlice.actions
