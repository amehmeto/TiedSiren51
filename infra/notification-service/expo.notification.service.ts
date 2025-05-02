import * as Notifications from 'expo-notifications'
import {
  NotificationService,
  NotificationTrigger,
} from '@/core/ports/notification.service'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { AppDispatch } from '@/core/_redux_/createStore'
import { checkAndNotifySessionChanges } from '@/core/block-session/usecases/handle-session-status-change.usecase'
import { DateProvider } from '@/core/ports/port.date-provider'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'

// Store reference to be injected
let dispatch: AppDispatch | null = null

export function setDispatch(appDispatch: AppDispatch): void {
  dispatch = appDispatch
}

export class ExpoNotificationService implements NotificationService {
  private dateProvider?: DateProvider
  private blockSessionRepository?: BlockSessionRepository

  // These dependencies will be set when startSessionStatusMonitoring is called
  setDependencies(
    dateProvider: DateProvider,
    blockSessionRepository: BlockSessionRepository,
  ): void {
    this.dateProvider = dateProvider
    this.blockSessionRepository = blockSessionRepository
  }

  async initialize(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    })
  }

  async requestNotificationPermissions(): Promise<void> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
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
  }

  async getNotificationToken(): Promise<string> {
    try {
      await this.requestNotificationPermissions()
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId

      if (!projectId) throw new Error('Project ID not found')

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      })

      return token.data
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      throw error
    }
  }

  async sendPushNotification(message: string): Promise<void> {
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

    if (!response.ok) {
      throw new Error('Failed to send push notification')
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: NotificationTrigger,
  ): Promise<string> {
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
  }

  async cancelScheduledNotifications(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  }

  startSessionStatusMonitoring(checkInterval = 3000): () => void {
    if (!this.dateProvider || !this.blockSessionRepository) {
      throw new Error(
        'Dependencies not set. Call setDependencies before starting monitoring.',
      )
    }

    if (!dispatch) {
      throw new Error(
        'Dispatch function not set. Call setDispatch before starting monitoring.',
      )
    }

    // Start the monitoring interval
    const intervalId = setInterval(async () => {
      if (!dispatch || !this.dateProvider || !this.blockSessionRepository)
        return

      // Get current sessions from the repository
      const appDispatch = dispatch
      const blockSessions = await this.blockSessionRepository.findAll()

      // Check for session status changes and send notifications
      checkAndNotifySessionChanges(
        appDispatch,
        this.dateProvider,
        blockSessions,
      ).catch((error) => {
        // Handle error silently in production
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('Error checking session status:', error)
        }
      })
    }, checkInterval)

    // Return a function that can be used to stop monitoring
    return () => {
      clearInterval(intervalId)
    }
  }
}
