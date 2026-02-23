import { differenceInSeconds } from 'date-fns'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'
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
      getState,
      extra: { blockSessionRepository, notificationService, dateProvider },
    },
  ) => {
    const userId = selectAuthUserId(getState())
    const { startedAt: rawStartedAt, endedAt: rawEndedAt, name } = payload
    const now = dateProvider.getNow()
    const startedAt = dateProvider.recoverDate(rawStartedAt)
    const endedAt = dateProvider.recoverDate(rawEndedAt)
    const startNotificationId =
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${name}" has started`,
        {
          seconds: differenceInSeconds(startedAt, now),
        },
      )
    const endNotificationId =
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${name}" has ended`,
        {
          seconds: differenceInSeconds(endedAt, now),
        },
      )
    return blockSessionRepository.create(userId, {
      ...payload,
      startNotificationId,
      endNotificationId,
    })
  },
)
