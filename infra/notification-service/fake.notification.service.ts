import {
  NotificationService,
  NotificationTrigger,
} from '@/core/ports/notification.service'
import uuid from 'react-native-uuid'

export class FakeNotificationService implements NotificationService {
  lastScheduledNotification: {
    title: string
    body: string
    trigger: NotificationTrigger
  }[] = []
  lastCancelledNotificationIds: string[] = []

  async sendPushNotification(message: string): Promise<void> {
    console.log(`Fake notification: ${message}`)
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
}
