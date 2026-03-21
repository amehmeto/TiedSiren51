export type ForegroundServiceConfig = {
  title: string
  description: string
}

export type ForegroundServiceActiveWindow = {
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export interface ForegroundService {
  start(config?: Partial<ForegroundServiceConfig>): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean
  setActiveWindows(windows: ForegroundServiceActiveWindow[]): Promise<void>
  clearActiveWindows(): Promise<void>
}
