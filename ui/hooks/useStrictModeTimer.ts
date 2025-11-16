import { useState, useEffect, useCallback, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { TimerStorage, TimerData } from '@/ui/utils/timerStorage'

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export const useStrictModeTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  })
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateTimeRemaining = useCallback(
    (endTime: number): TimeRemaining => {
      const now = Date.now()
      const difference = endTime - now

      if (difference <= 0)
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds, total: difference }
    },
    [],
  )

  const startTimer = useCallback(
    async (days: number, hours: number, minutes: number) => {
      const durationMs =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000

      if (durationMs <= 0) return

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
    setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
  }, [])

  const extendTimer = useCallback(
    async (
      additionalDays: number,
      additionalHours: number,
      additionalMinutes: number,
    ) => {
      const timerData = await TimerStorage.loadTimer()
      if (!timerData?.isActive) return

      const additionalMs =
        additionalDays * 24 * 60 * 60 * 1000 +
        additionalHours * 60 * 60 * 1000 +
        additionalMinutes * 60 * 1000

      const newEndTime = timerData.endTime + additionalMs
      const updatedTimerData: TimerData = {
        ...timerData,
        endTime: newEndTime,
        duration: timerData.duration + additionalMs,
      }

      await TimerStorage.saveTimer(updatedTimerData)
      setTimeRemaining(calculateTimeRemaining(newEndTime))
    },
    [calculateTimeRemaining],
  )

  const updateTimer = useCallback(async () => {
    const timerData = await TimerStorage.loadTimer()

    if (!timerData?.isActive) {
      setIsActive(false)
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
      return
    }

    const remaining = calculateTimeRemaining(timerData.endTime)

    if (remaining.total <= 0) await stopTimer()
    else {
      setIsActive(true)
      setTimeRemaining(remaining)
    }
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
    if (isActive) {
      intervalRef.current = setInterval(() => {
        updateTimer()
      }, 1000)
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, updateTimer])

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') updateTimer()
      },
    )

    return () => {
      subscription.remove()
    }
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
