import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const deleteBlockSession = createAppAsyncThunk(
  'blockSession/deleteBlockSession',
  async (
    sessionId: string,
    { extra: { blockSessionRepository, notificationService } },
  ) => {
    const session = await blockSessionRepository.findById(sessionId)
    await notificationService.cancelScheduledNotifications(
      session.startNotificationId,
    )
    await notificationService.cancelScheduledNotifications(
      session.endNotificationId,
    )
    await blockSessionRepository.delete(sessionId)
    return sessionId
  },
)
