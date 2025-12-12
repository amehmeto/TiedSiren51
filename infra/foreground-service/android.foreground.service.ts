import * as ForegroundModule from 'foreground-ss'
import { PermissionsAndroid, Platform } from 'react-native'
import {
  ForegroundService,
  ForegroundServiceConfig,
} from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'

const DEFAULT_CONFIG: ForegroundServiceConfig = {
  title: 'TiedSiren is protecting you',
  description: 'Monitoring for blocked apps',
}

const POST_NOTIFICATIONS_PERMISSION = 'android.permission.POST_NOTIFICATIONS'

export class AndroidForegroundService implements ForegroundService {
  private running = false

  constructor(private readonly logger: Logger) {}

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    if (Platform.OS !== 'android') {
      this.logger.info('Foreground service only available on Android')
      return
    }

    if (this.running) {
      this.logger.info('Foreground service already running')
      return
    }

    const mergedConfig = { ...DEFAULT_CONFIG, ...config }
    await this.startService(mergedConfig)
  }

  private async startService(config: ForegroundServiceConfig): Promise<void> {
    try {
      await this.requestNotificationPermission()

      ForegroundModule.Foreground.startForegroundService(
        '',
        config.title,
        config.description,
        0,
      )

      this.running = true
      this.logger.info('Foreground service started')
    } catch (error) {
      this.logger.error(`Failed to start foreground service: ${error}`)
      throw error
    }
  }

  async stop(): Promise<void> {
    if (Platform.OS !== 'android') return

    if (!this.running) {
      this.logger.info('Foreground service not running')
      return
    }

    await this.stopService()
  }

  private async stopService(): Promise<void> {
    try {
      ForegroundModule.Foreground.stopForegroundService()
      this.running = false
      this.logger.info('Foreground service stopped')
    } catch (error) {
      this.logger.error(`Failed to stop foreground service: ${error}`)
      throw error
    }
  }

  isRunning(): boolean {
    return this.running
  }

  private async requestNotificationPermission(): Promise<void> {
    if (Platform.OS !== 'android') return

    await this.checkAndRequestPermission()
  }

  private async checkAndRequestPermission(): Promise<void> {
    try {
      // POST_NOTIFICATIONS is Android 13+ and not in RN's Permission type
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const permission = POST_NOTIFICATIONS_PERMISSION as Parameters<
        typeof PermissionsAndroid.check
      >[0]

      const hasPermission = await PermissionsAndroid.check(permission)

      if (!hasPermission) {
        await PermissionsAndroid.request(permission, {
          title: 'TiedSiren Notification Permission',
          message:
            'TiedSiren needs notification permission to show protection status',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        })
      }
    } catch (error) {
      this.logger.error(`Failed to request notification permission: ${error}`)
      throw error
    }
  }
}
