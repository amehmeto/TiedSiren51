import { differenceInSeconds } from 'date-fns'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { BlockSession } from '../block.session'

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
        logger,
      },
    },
  ) => {
    logger.info('[createBlockSession] Starting block session creation')
    logger.info(`[createBlockSession] Payload: ${JSON.stringify(payload)}`)

    await backgroundTaskService.scheduleTask('target-sirens')
    logger.info('[createBlockSession] Background task scheduled')

    const now = dateProvider.getNow()
    const startedAt = dateProvider.recoverDate(payload.startedAt)
    const endedAt = dateProvider.recoverDate(payload.endedAt)

    logger.info(`[createBlockSession] Scheduling start notification`)
    const startNotificationId =
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has started`,
        {
          seconds: differenceInSeconds(startedAt, now),
        },
      )
    logger.info(
      `[createBlockSession] Start notification scheduled: ${startNotificationId}`,
    )

    logger.info(`[createBlockSession] Scheduling end notification`)
    const endNotificationId =
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has ended`,
        {
          seconds: differenceInSeconds(endedAt, now),
        },
      )
    logger.info(
      `[createBlockSession] End notification scheduled: ${endNotificationId}`,
    )

    logger.info('[createBlockSession] Creating block session in repository')
    const result = await blockSessionRepository.create({
      ...payload,
      startNotificationId,
      endNotificationId,
    })
    logger.info(
      `[createBlockSession] Block session created: ${JSON.stringify(result)}`,
    )

    return result
  },
)
