import {
  ForegroundService,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'

export class InMemoryForegroundService implements ForegroundService {
  private _isRunning = false

  public startCallCount = 0

  public stopCallCount = 0

  public lastConfig: Partial<ForegroundServiceConfig> | undefined

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    this.startCallCount++
    this.lastConfig = config
    this._isRunning = true
  }

  async stop(): Promise<void> {
    this.stopCallCount++
    this._isRunning = false
  }

  isRunning(): boolean {
    return this._isRunning
  }

  reset(): void {
    this._isRunning = false
    this.startCallCount = 0
    this.stopCallCount = 0
    this.lastConfig = undefined
  }
}
