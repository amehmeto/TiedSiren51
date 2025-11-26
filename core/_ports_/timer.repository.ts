export type TimerData = {
  endAt: number
}

export interface TimerRepository {
  saveTimer(userId: string, data: TimerData): Promise<void>
  loadTimer(userId: string): Promise<TimerData | null>
}
