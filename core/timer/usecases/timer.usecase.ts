import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Timer } from '../timer'
import { calculateMilliseconds } from '../timer.utils'

export const loadTimer = createAppAsyncThunk<Timer | null, void>(
  'timer/loadTimer',
  async (_, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) return null
    return timerRepository.loadTimer(userId)
  },
)

type StartTimerPayload = {
  days: number
  hours: number
  minutes: number
}

export const startTimer = createAppAsyncThunk<Timer, StartTimerPayload>(
  'timer/startTimer',
  async (payload, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const durationMs = calculateMilliseconds(payload)

    if (durationMs <= 0) throw new Error('Invalid timer duration')

    const endTime = Date.now() + durationMs

    const timerData: Timer = {
      endTime,
      duration: durationMs,
      isActive: true,
    }

    await timerRepository.saveTimer(userId, timerData)
    return timerData
  },
)

export const stopTimer = createAppAsyncThunk<void, void>(
  'timer/stopTimer',
  async (_, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')
    await timerRepository.clearTimer(userId)
  },
)

type ExtendTimerPayload = {
  days: number
  hours: number
  minutes: number
}

export const extendTimer = createAppAsyncThunk<Timer, ExtendTimerPayload>(
  'timer/extendTimer',
  async (payload, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const currentTimer = getState().timer.timer

    if (!currentTimer?.isActive) throw new Error('No active timer to extend')

    const additionalMs = calculateMilliseconds(payload)
    const newEndTime = currentTimer.endTime + additionalMs

    const updatedTimer: Timer = {
      endTime: newEndTime,
      duration: currentTimer.duration + additionalMs,
      isActive: true,
    }

    await timerRepository.saveTimer(userId, updatedTimer)
    return updatedTimer
  },
)
