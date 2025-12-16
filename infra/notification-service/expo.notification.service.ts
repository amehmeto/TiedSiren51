import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Logger } from '@/core/_ports_/logger'
import { NotificationService } from '@/core/_ports_/notification.service'

export class ExpoNotificationService implements NotificationService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      })
    } catch (error) {
      this.logger.error(
        `[ExpoNotificationService] Failed to initialize notification service: ${error}`,
      )
      throw error
    }
  }

  async requestNotificationPermissions(): Promise<void> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // installation, so this will only ask on iOS
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted')
        throw new Error('Failed to get push token for push notification!')
    } catch (error) {
      this.logger.error(
        `[ExpoNotificationService] Failed to request notification permissions: ${error}`,
      )
      throw error
    }
  }

  async getNotificationToken(): Promise<string> {
    try {
      await this.requestNotificationPermissions()
      const projectId = Constants.expoConfig?.extra?.eas?.projectId

      if (!projectId) throw new Error('Project ID not found')

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      })

      return token.data
    } catch (error) {
      this.logger.error(`[ExpoNotificationService] ${error}`)
      throw error
    }
  }

  async sendPushNotification(message: string): Promise<void> {
    try {
      await this.requestNotificationPermissions()
      const token = await this.getNotificationToken()
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          data: { extraData: 'Some extra data' },
          title: 'Notification title',
          body: message,
          sound: 'default',
        }),
      })

      if (!response.ok) throw new Error('Failed to send push notification')
    } catch (error) {
      this.logger.error(
        `[ExpoNotificationService] Failed to send push notification: ${error}`,
      )
      throw error
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
  ): Promise<string> {
    try {
      if (Platform.OS === 'web')
        return 'Local notifications are not supported on web'

      await this.requestNotificationPermissions()
      return Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: { data: 'goes here' },
        },
        trigger,
      })
    } catch (error) {
      this.logger.error(
        `[ExpoNotificationService] Failed to schedule local notification: ${error}`,
      )
      throw error
    }
  }

  async cancelScheduledNotifications(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
    } catch (error) {
      this.logger.error(
        `[ExpoNotificationService] Failed to cancel scheduled notification ${notificationId}: ${error}`,
      )
      throw error
    }
  }
}
