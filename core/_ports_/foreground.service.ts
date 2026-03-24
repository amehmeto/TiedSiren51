import { HHmmString } from '@/core/_ports_/date-provider'

export type ForegroundServiceConfig = {
  title: string
  description: string
}

export type BlockingSessionWindow = {
  startTime: HHmmString
  endTime: HHmmString
}

export interface ForegroundService {
  start(config?: Partial<ForegroundServiceConfig>): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean
  scheduleBlockingSessions(windows: BlockingSessionWindow[]): Promise<void>
}
