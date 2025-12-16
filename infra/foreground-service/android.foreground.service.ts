import * as ExpoForegroundService from '@amehmeto/expo-foreground-service'
import { Platform } from 'react-native'
import {
  ForegroundService,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'

const DEFAULT_CONFIG: ForegroundServiceConfig = {
  title: 'TiedSiren is protecting you',
  description: 'Monitoring for blocked apps',
}

const CHANNEL_ID = 'tied-siren-foreground-service'
const CHANNEL_NAME = 'TiedSiren Protection'

export class AndroidForegroundService implements ForegroundService {
  private isServiceRunning = false

  constructor(private readonly logger: Logger) {}

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    if (Platform.OS !== 'android') {
      this.logger.info('Foreground service only available on Android')
      return
    }

    if (this.isServiceRunning) {
      this.logger.info('Foreground service already running')
      return
    }

    const mergedConfig = { ...DEFAULT_CONFIG, ...config }
    await this.startService(mergedConfig)
  }

  private async startService(config: ForegroundServiceConfig): Promise<void> {
    const isPermissionGranted = await this.requestNotificationPermission()
    this.logPermissionStatus(isPermissionGranted)
    await this.startServiceWithConfig(config)
  }

  private logPermissionStatus(isPermissionGranted: boolean): void {
    if (!isPermissionGranted) {
      this.logger.warn(
        'Notification permission denied, service may not show notification',
      )
    }
  }

  private async startServiceWithConfig(
    config: ForegroundServiceConfig,
  ): Promise<void> {
    try {
      await ExpoForegroundService.startService({
        channelId: CHANNEL_ID,
        channelName: CHANNEL_NAME,
        notificationTitle: config.title,
        notificationBody: config.description,
      })

      this.isServiceRunning = true
      this.logger.info('Foreground service started')
    } catch (error) {
      this.logger.error(`Failed to start foreground service: ${error}`)
      throw error
    }
  }

  async stop(): Promise<void> {
    if (Platform.OS !== 'android') return

    if (!this.isServiceRunning) {
      this.logger.info('Foreground service not running')
      return
    }

    await this.stopService()
  }

  private async stopService(): Promise<void> {
    try {
      await ExpoForegroundService.stopService()
      this.isServiceRunning = false
      this.logger.info('Foreground service stopped')
    } catch (error) {
      this.logger.error(`Failed to stop foreground service: ${error}`)
      throw error
    }
  }

  isRunning(): boolean {
    return this.isServiceRunning
  }

  private async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true

    return this.doRequestPermission()
  }

  private async doRequestPermission(): Promise<boolean> {
    try {
      const result = await ExpoForegroundService.requestPermissions()
      return result.granted
    } catch (error) {
      this.logger.error(`Failed to request notification permission: ${error}`)
      return false
    }
  }
}
