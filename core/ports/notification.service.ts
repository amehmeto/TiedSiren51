export type NotificationTrigger = {
  seconds: number
  repeats?: boolean
}

export interface NotificationService {
  sendPushNotification(message: string): Promise<void>
  scheduleLocalNotification(
    title: string,
    body: string,
    trigger: NotificationTrigger,
  ): Promise<string>
  cancelScheduledNotifications(notificationId: string): Promise<void>
}
