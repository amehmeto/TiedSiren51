export type TimerData = {
  endTime: number
  duration: number
  isActive: boolean
}

export interface TimerRepository {
  saveTimer(userId: string, data: TimerData): Promise<void>
  loadTimer(userId: string): Promise<TimerData | null>
  clearTimer(userId: string): Promise<void>
}
