export type ForegroundServiceConfig = {
  title: string
  description: string
}

export interface ForegroundService {
  start(config?: Partial<ForegroundServiceConfig>): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean
}
