import AsyncStorage from '@react-native-async-storage/async-storage'

const TIMER_STORAGE_KEY = '@strict_mode_timer'

export type TimerData = {
  endTime: number
  duration: number
  isActive: boolean
}

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

      return JSON.parse(jsonValue) as TimerData
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
