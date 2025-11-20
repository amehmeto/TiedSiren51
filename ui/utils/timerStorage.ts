import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

const TIMER_STORAGE_KEY = '@strict_mode_timer'

const timerDataSchema = z.object({
  endTime: z.number(),
  duration: z.number(),
  isActive: z.boolean(),
})

export type TimerData = z.infer<typeof timerDataSchema>

export const TimerStorage = {
  async saveTimer(data: TimerData): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data)
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, jsonValue)
    } catch (error) {
      throw error
    }
  },

  async loadTimer(): Promise<TimerData | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(TIMER_STORAGE_KEY)
      if (jsonValue === null) return null

      const parsed = JSON.parse(jsonValue)
      return timerDataSchema.parse(parsed)
    } catch {
      return null
    }
  },

  async clearTimer(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TIMER_STORAGE_KEY)
    } catch (error) {
      throw error
    }
  },
}
