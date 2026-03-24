import {
  BlockingSessionWindow,
  ForegroundService,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'

export class InMemoryForegroundService implements ForegroundService {
  private isServiceRunning = false

  public startCallCount = 0

  public stopCallCount = 0

  public lastConfig: Partial<ForegroundServiceConfig> | undefined

  public shouldThrowOnStart = false

  public shouldThrowOnStop = false

  public activeWindows: BlockingSessionWindow[] = []

  public scheduleBlockingSessionsCallCount = 0

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    this.startCallCount++
    if (this.shouldThrowOnStart)
      throw new Error('Start foreground service failed')
    this.lastConfig = config
    this.isServiceRunning = true
  }

  async stop(): Promise<void> {
    this.stopCallCount++
    if (this.shouldThrowOnStop)
      throw new Error('Stop foreground service failed')
    this.isServiceRunning = false
  }

  isRunning(): boolean {
    return this.isServiceRunning
  }

  async scheduleBlockingSessions(
    windows: BlockingSessionWindow[],
  ): Promise<void> {
    this.scheduleBlockingSessionsCallCount++
    this.activeWindows = windows
  }

  reset(): void {
    this.isServiceRunning = false
    this.startCallCount = 0
    this.stopCallCount = 0
    this.lastConfig = undefined
    this.activeWindows = []
    this.scheduleBlockingSessionsCallCount = 0
  }
}
