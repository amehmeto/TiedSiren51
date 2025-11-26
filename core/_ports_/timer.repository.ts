export interface TimerRepository {
  saveTimer(userId: string, endAt: string): Promise<void>
  loadTimer(userId: string): Promise<string | null>
}
