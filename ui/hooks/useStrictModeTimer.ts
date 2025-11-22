import { useState, useEffect, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import {
  calculateMilliseconds,
  millisecondsToTimeUnits,
} from '@/ui/utils/timeConstants'
import { TimerStorage, TimerData } from '@/ui/utils/timerStorage'

export type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

const EMPTY_TIME: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
}

const UPDATE_INTERVAL_MS = 1000

export const useStrictModeTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(EMPTY_TIME)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const calculateTimeRemaining = useCallback(
    (endTime: number): TimeRemaining => {
      const now = Date.now()
      const difference = endTime - now

      const noTimeLeft = difference <= 0
      if (noTimeLeft) return EMPTY_TIME

      const timeUnits = millisecondsToTimeUnits(difference)

      return { ...timeUnits, total: difference }
    },
    [],
  )

  const startTimer = useCallback(
    async (days: number, hours: number, minutes: number) => {
      const durationMs = calculateMilliseconds({ days, hours, minutes })

      const isInvalidDuration = durationMs <= 0
      if (isInvalidDuration) return

      const endTime = Date.now() + durationMs

      const timerData: TimerData = {
        endTime,
        duration: durationMs,
        isActive: true,
      }
      await TimerStorage.saveTimer(timerData)

      setIsActive(true)
      setTimeRemaining(calculateTimeRemaining(endTime))
    },
    [calculateTimeRemaining],
  )

  const stopTimer = useCallback(async () => {
    await TimerStorage.clearTimer()
    setIsActive(false)
    setTimeRemaining(EMPTY_TIME)
  }, [])

  const extendTimer = useCallback(
    async (
      additionalDays: number,
      additionalHours: number,
      additionalMinutes: number,
    ) => {
      const timerData = await TimerStorage.loadTimer()

      const noActiveTimer = !timerData?.isActive
      if (noActiveTimer) return

      const additionalMs = calculateMilliseconds({
        days: additionalDays,
        hours: additionalHours,
        minutes: additionalMinutes,
      })

      const newEndTime = timerData.endTime + additionalMs

      const updatedTimerData: TimerData = {
        endTime: newEndTime,
        duration: timerData.duration + additionalMs,
        isActive: true,
      }
      await TimerStorage.saveTimer(updatedTimerData)

      setTimeRemaining(calculateTimeRemaining(newEndTime))
    },
    [calculateTimeRemaining],
  )

  const updateTimer = useCallback(async () => {
    const timerData = await TimerStorage.loadTimer()

    const noActiveTimer = !timerData?.isActive
    if (noActiveTimer) {
      setIsActive(false)
      setTimeRemaining(EMPTY_TIME)
      return
    }

    const remaining = calculateTimeRemaining(timerData.endTime)

    const hasExpired = remaining.total <= 0
    if (hasExpired) {
      await stopTimer()
      return
    }

    setIsActive(true)
    setTimeRemaining(remaining)
  }, [calculateTimeRemaining, stopTimer])

  useEffect(() => {
    const loadTimer = async () => {
      setIsLoading(true)
      await updateTimer()
      setIsLoading(false)
    }

    loadTimer()
  }, [updateTimer])

  useEffect(() => {
    if (!isActive) return

    const intervalId = setInterval(updateTimer, UPDATE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [isActive, updateTimer])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isComingToForeground = nextAppState === 'active'
      if (isComingToForeground) updateTimer()
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [updateTimer])

  return {
    timeRemaining,
    isActive,
    isLoading,
    startTimer,
    stopTimer,
    extendTimer,
  }
}
