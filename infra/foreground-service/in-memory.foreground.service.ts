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

  addServiceStateListener(callback: (isRunning: boolean) => void): () => void {
    this._serviceStateCallbacks.push(callback)
    return () => {
      this._serviceStateCallbacks = this._serviceStateCallbacks.filter(
        (cb) => cb !== callback,
      )
    }
  }

  /** Simulate a native service state change (e.g., from AlarmManager) */
  simulateNativeServiceStart(): void {
    this.isServiceRunning = true
    this._serviceStateCallbacks.forEach((cb) => cb(true))
  }

  simulateNativeServiceStop(): void {
    this.isServiceRunning = false
    this._serviceStateCallbacks.forEach((cb) => cb(false))
  }

  private _serviceStateCallbacks: ((isRunning: boolean) => void)[] = []

  reset(): void {
    this.isServiceRunning = false
    this.startCallCount = 0
    this.stopCallCount = 0
    this.lastConfig = undefined
    this.activeWindows = []
    this.setActiveWindowsCallCount = 0
    this._serviceStateCallbacks = []
  }
}
