import uuid from 'react-native-uuid'
import { Logger } from '@/core/_ports_/logger'
import {
  NotificationService,
  NotificationTrigger,
} from '@/core/_ports_/notification.service'

export class FakeNotificationService implements NotificationService {
  lastScheduledNotification: {
    title: string
    body: string
    trigger: NotificationTrigger
  }[] = []

  lastCancelledNotificationIds: string[] = []

  constructor(private readonly logger: Logger) {}

  async sendPushNotification(message: string): Promise<void> {
    this.logger.info(`Fake notification: ${message}`)
  }

  scheduleLocalNotification(
    title: string,
    body: string,
    trigger: NotificationTrigger,
  ): Promise<string> {
    this.lastScheduledNotification.push({
      title,
      body,
      trigger,
    })
    return Promise.resolve(String(uuid.v4()))
  }

  cancelScheduledNotifications(notificationId: string): Promise<void> {
    this.lastCancelledNotificationIds.push(notificationId)
    return Promise.resolve()
  }

  initialize(): Promise<void> {
    return Promise.resolve(undefined)
  }
}
