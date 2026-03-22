import * as ExpoForegroundService from '@amehmeto/expo-foreground-service'
import { Platform } from 'react-native'
import {
  ForegroundService,
  ForegroundServiceActiveWindow,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'

export class AndroidForegroundService implements ForegroundService {
  private static readonly DEFAULT_CONFIG: ForegroundServiceConfig = {
    title: 'TiedSiren is protecting you',
    description: 'Monitoring for blocked apps',
  }

  private static readonly CHANNEL_ID = 'tied-siren-foreground-service'

  private static readonly CHANNEL_NAME = 'TiedSiren Protection'

  private isServiceRunning = false

  constructor(private readonly logger: Logger) {
    if (Platform.OS === 'android') {
      ExpoForegroundService.addServiceEventListener((event) => {
        this.isServiceRunning = event.isRunning
      })
    }
  }

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        this.logger.info(
          '[AndroidForegroundService] Foreground service only available on Android',
        )
        return
      }

      if (this.isServiceRunning) {
        this.logger.info(
          '[AndroidForegroundService] Foreground service already running',
        )
        return
      }

      const mergedConfig = {
        ...AndroidForegroundService.DEFAULT_CONFIG,
        ...config,
      }

      await this.requestNotificationPermission()
      await this.startService(mergedConfig)
      this.isServiceRunning = true
      this.logger.info('[AndroidForegroundService] Foreground service started')
    } catch (error) {
      this.logger.error(`[AndroidForegroundService] Failed to start: ${error}`)
      throw error
    }
  }

  async stop(): Promise<void> {
    try {
      if (Platform.OS !== 'android') return

      if (!this.isServiceRunning) {
        this.logger.info(
          '[AndroidForegroundService] Foreground service not running',
        )
        return
      }

      await this.stopService()
      this.isServiceRunning = false
      this.logger.info('[AndroidForegroundService] Foreground service stopped')
    } catch (error) {
      this.logger.error(`[AndroidForegroundService] Failed to stop: ${error}`)
      throw error
    }
  }

  isRunning(): boolean {
    return this.isServiceRunning
  }

  async clearActiveWindows(): Promise<void> {
    try {
      if (Platform.OS !== 'android') return

      await ExpoForegroundService.clearActiveWindows()
      this.logger.info('[AndroidForegroundService] Cleared active windows')
    } catch (error) {
      this.logger.error(
        `[AndroidForegroundService] Failed to clear active windows: ${error}`,
      )
      throw error
    }
  }

  async setActiveWindows(
    windows: ForegroundServiceActiveWindow[],
  ): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        this.logger.info(
          '[AndroidForegroundService] Active windows only available on Android',
        )
        return
      }

      await ExpoForegroundService.setActiveWindows(windows)
      this.logger.info(
        `[AndroidForegroundService] Set ${windows.length} active windows`,
      )
    } catch (error) {
      this.logger.error(
        `[AndroidForegroundService] Failed to set active windows: ${error}`,
      )
      throw error
    }
  }

  addServiceStateListener(callback: (isRunning: boolean) => void): () => void {
    const subscription = ExpoForegroundService.addServiceEventListener(
      (event) => {
        callback(event.isRunning)
      },
    )
    return () => subscription.remove()
  }

  private async requestNotificationPermission(): Promise<void> {
    const permissionStatus = await ExpoForegroundService.requestPermissions()
    if (!permissionStatus.granted) {
      this.logger.warn(
        '[AndroidForegroundService] Notification permission denied, service may not show notification',
      )
    }
  }

  private async startService(config: ForegroundServiceConfig): Promise<void> {
    await ExpoForegroundService.startService({
      channelId: AndroidForegroundService.CHANNEL_ID,
      channelName: AndroidForegroundService.CHANNEL_NAME,
      notificationTitle: config.title,
      notificationBody: config.description,
    })
  }

  private async stopService(): Promise<void> {
    await ExpoForegroundService.stopService()
  }
}
