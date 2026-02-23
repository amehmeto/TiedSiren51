import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

export const deleteBlockSession = createAppAsyncThunk(
  'blockSession/deleteBlockSession',
  async (
    sessionId: string,
    { getState, extra: { blockSessionRepository, notificationService } },
  ) => {
    const userId = selectAuthUserId(getState())
    const session = await blockSessionRepository.findById(userId, sessionId)
    await notificationService.cancelScheduledNotifications(
      session.startNotificationId,
    )
    await notificationService.cancelScheduledNotifications(
      session.endNotificationId,
    )
    await blockSessionRepository.delete(userId, sessionId)
    return sessionId
  },
)
