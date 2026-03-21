import {
  ForegroundService,
  ForegroundServiceActiveWindow,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'

export class InMemoryForegroundService implements ForegroundService {
  private isServiceRunning = false

  public startCallCount = 0

  public stopCallCount = 0

  public lastConfig: Partial<ForegroundServiceConfig> | undefined

  public shouldThrowOnStart = false

  public shouldThrowOnStop = false

  public activeWindows: ForegroundServiceActiveWindow[] = []

  public setActiveWindowsCallCount = 0

  public clearActiveWindowsCallCount = 0

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

  async setActiveWindows(
    windows: ForegroundServiceActiveWindow[],
  ): Promise<void> {
    this.setActiveWindowsCallCount++
    this.activeWindows = windows
  }

  async clearActiveWindows(): Promise<void> {
    this.clearActiveWindowsCallCount++
    this.activeWindows = []
  }

  reset(): void {
    this.isServiceRunning = false
    this.startCallCount = 0
    this.stopCallCount = 0
    this.lastConfig = undefined
    this.activeWindows = []
    this.setActiveWindowsCallCount = 0
    this.clearActiveWindowsCallCount = 0
  }
}
