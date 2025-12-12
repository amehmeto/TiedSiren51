import {
  ForegroundService,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'

export class InMemoryForegroundService implements ForegroundService {
  private running = false

  public startCallCount = 0

  public stopCallCount = 0

  public lastConfig: Partial<ForegroundServiceConfig> | undefined

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    this.startCallCount++
    this.lastConfig = config
    this.running = true
  }

  async stop(): Promise<void> {
    this.stopCallCount++
    this.running = false
  }

  isRunning(): boolean {
    return this.running
  }

  reset(): void {
    this.running = false
    this.startCallCount = 0
    this.stopCallCount = 0
    this.lastConfig = undefined
  }
}
