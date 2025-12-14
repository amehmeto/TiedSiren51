import { differenceInSeconds } from 'date-fns'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { BlockSession } from '../block-session'

export type CreateBlockSessionPayload = Omit<
  BlockSession,
  'id' | 'startNotificationId' | 'endNotificationId'
>
export const createBlockSession = createAppAsyncThunk(
  'blockSession/createBlockSession',
  async (
    payload: CreateBlockSessionPayload,
    {
      extra: {
        blockSessionRepository,
        notificationService,
        dateProvider,
        backgroundTaskService,
      },
    },
  ) => {
    await backgroundTaskService.scheduleTask('target-sirens')
    const now = dateProvider.getNow()
    const startedAt = dateProvider.recoverDate(payload.startedAt)
    const endedAt = dateProvider.recoverDate(payload.endedAt)
    const startNotificationId =
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has started`,
        {
          seconds: differenceInSeconds(startedAt, now),
        },
      )
    const endNotificationId =
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has ended`,
        {
          seconds: differenceInSeconds(endedAt, now),
        },
      )
    return blockSessionRepository.create({
      ...payload,
      startNotificationId,
      endNotificationId,
    })
  },
)
