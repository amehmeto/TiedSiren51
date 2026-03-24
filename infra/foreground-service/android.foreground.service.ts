import * as ExpoForegroundService from '@amehmeto/expo-foreground-service'
import { Platform } from 'react-native'
import {
  BlockingSessionWindow,
  ForegroundService,
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
    // Sync isServiceRunning from native events so isRunning() stays accurate
    // even when the service is started/stopped by AlarmManager outside JS control.
    // This is separate from addServiceStateListener which notifies external consumers.
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

  async scheduleBlockingSessions(
    windows: BlockingSessionWindow[],
  ): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        this.logger.info(
          '[AndroidForegroundService] Blocking sessions scheduling only available on Android',
        )
        return
      }

      await ExpoForegroundService.setActiveWindows(windows)
      this.logger.info(
        `[AndroidForegroundService] Scheduled ${windows.length} blocking sessions`,
      )
    } catch (error) {
      this.logger.error(
        `[AndroidForegroundService] Failed to schedule blocking sessions: ${error}`,
      )
      throw error
    }
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
