import { HHmmString } from '@/core/_ports_/date-provider'

export type ForegroundServiceConfig = {
  title: string
  description: string
}

export type ForegroundServiceActiveWindow = {
  startTime: HHmmString
  endTime: HHmmString
}

export interface ForegroundService {
  start(config?: Partial<ForegroundServiceConfig>): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean
  setActiveWindows(windows: ForegroundServiceActiveWindow[]): Promise<void>
  clearActiveWindows(): Promise<void>
  addServiceStateListener(callback: (isRunning: boolean) => void): () => void
}
