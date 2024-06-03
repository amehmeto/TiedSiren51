import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { differenceInSeconds } from 'date-fns'

export const duplicateBlockSession = createAppAsyncThunk(
  'blockSession/duplicateBlockSession',
  async (
    payload: { id: string; name: string },
    { extra: { blockSessionRepository, notificationService, dateProvider } },
  ) => {
    const sessionToBeCopied = await blockSessionRepository.findById(payload.id)

    const now = dateProvider.getNow()
    const startedAt = dateProvider.recoverDate(sessionToBeCopied.startedAt)
    const endedAt = dateProvider.recoverDate(sessionToBeCopied.endedAt)
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

    const { id, ...sessionWithoutId } = sessionToBeCopied
    const duplicatedSession = {
      ...sessionWithoutId,
      name: payload.name,
      startNotificationId,
      endNotificationId,
    }
    return blockSessionRepository.create(duplicatedSession)
  },
)
