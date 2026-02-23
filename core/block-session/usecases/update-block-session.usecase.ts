import { differenceInSeconds } from 'date-fns'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectAuthUserId } from '@/core/auth/selectors/selectAuthUserId'
import { BlockSession } from '@/core/block-session/block-session'

export type UpdateBlockSessionPayload = UpdatePayload<BlockSession>

export const updateBlockSession = createAppAsyncThunk(
  'blockSession/updateBlockSession',
  async (
    payload: UpdateBlockSessionPayload,
    {
      getState,
      extra: { blockSessionRepository, notificationService, dateProvider },
    },
  ) => {
    const userId = selectAuthUserId(getState())
    const existingBlockSession = await blockSessionRepository.findById(
      userId,
      payload.id,
    )
    const now = dateProvider.getNow()

    let startedAt, endedAt, startNotificationId, endNotificationId
    if (payload.startedAt) {
      await notificationService.cancelScheduledNotifications(
        existingBlockSession.startNotificationId,
      )
      startedAt = dateProvider.recoverDate(payload.startedAt)
      startNotificationId = await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has started`,
        {
          seconds: differenceInSeconds(startedAt, now),
        },
      )
    }

    if (payload.endedAt) {
      await notificationService.cancelScheduledNotifications(
        existingBlockSession.endNotificationId,
      )
      endedAt = dateProvider.recoverDate(payload.endedAt)
      endNotificationId = await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has ended`,
        {
          seconds: differenceInSeconds(endedAt, now),
        },
      )
    }

    const toUpdateBlockSession = {
      ...payload,
      startNotificationId:
        startNotificationId ?? existingBlockSession.startNotificationId,
      endNotificationId:
        endNotificationId ?? existingBlockSession.endNotificationId,
    }
    await blockSessionRepository.update(userId, toUpdateBlockSession)
    return toUpdateBlockSession
  },
)
