import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { BlockSession } from '../block.session'
import { AppDispatch } from '../../_redux_/createStore'
import { DateProvider } from '../../ports/port.date-provider'

// Track notifications that have been sent to prevent duplicates
const notifiedSessionsMap = new Map<string, { start: boolean; end: boolean }>()

// Track last notification time for rate limiting
let lastNotificationTime = 0
let lastNotificationMessage = ''

export type SessionStatusPayload = {
  sessionId: string
  sessionName: string
  isStart: boolean
}

export const handleSessionStatusChange = createAppAsyncThunk(
  'blockSession/handleSessionStatusChange',
  async (payload: SessionStatusPayload, { extra: { notificationService } }) => {
    const { sessionId, sessionName, isStart } = payload

    const sessionStatus = notifiedSessionsMap.get(sessionId) || {
      start: false,
      end: false,
    }

    const shouldSendNotification = isStart
      ? !sessionStatus.start
      : !sessionStatus.end

    if (shouldSendNotification) {
      const notificationMessage = isStart
        ? `Session "${sessionName}" has started`
        : `Session "${sessionName}" has ended`

      const now = Date.now()
      const timeSinceLastNotification = now - lastNotificationTime

      // Rate limit notifications (5 second interval for identical messages)
      if (
        timeSinceLastNotification < 5000 &&
        lastNotificationMessage === notificationMessage
      ) {
        return {
          sessionId,
          notificationSent: false,
          notificationType: isStart ? 'start' : 'end',
          reason: 'rate-limited',
        }
      }

      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        notificationMessage,
        { seconds: 1 },
      )

      lastNotificationTime = now
      lastNotificationMessage = notificationMessage

      // Mark this notification as sent
      notifiedSessionsMap.set(sessionId, {
        ...sessionStatus,
        start: isStart ? true : sessionStatus.start,
        end: isStart ? sessionStatus.end : true,
      })

      return {
        sessionId,
        notificationSent: true,
        notificationType: isStart ? 'start' : 'end',
      }
    }

    return {
      sessionId,
      notificationSent: false,
      notificationType: isStart ? 'start' : 'end',
      reason: 'already-sent',
    }
  },
)

export const isSessionActive = (
  dateProvider: DateProvider,
  session: BlockSession,
): boolean => {
  const start = dateProvider.recoverDate(session.startedAt)
  const end = dateProvider.recoverDate(session.endedAt)
  const now = dateProvider.getNow()

  return now >= start && now < end
}

export const checkAndNotifySessionChanges = async (
  dispatch: AppDispatch,
  dateProvider: DateProvider,
  sessions: BlockSession[],
): Promise<void> => {
  const now = dateProvider.getNow()

  const sessionsToNotify: {
    session: BlockSession
    isStart: boolean
  }[] = []

  for (const session of sessions) {
    const start = dateProvider.recoverDate(session.startedAt)
    const end = dateProvider.recoverDate(session.endedAt)

    const justStarted =
      now >= start &&
      now < end &&
      Math.abs(now.getTime() - start.getTime()) < 5000

    const justEnded =
      now >= end && Math.abs(now.getTime() - end.getTime()) < 500

    if (justStarted) {
      sessionsToNotify.push({ session, isStart: true })
    }

    if (justEnded) {
      sessionsToNotify.push({ session, isStart: false })
    }
  }

  if (sessionsToNotify.length > 0) {
    for (const { session, isStart } of sessionsToNotify) {
      await dispatch(
        handleSessionStatusChange({
          sessionId: session.id,
          sessionName: session.name,
          isStart,
        }),
      )
    }
  }
}

export type NotificationCrudOperation =
  | 'create'
  | 'update'
  | 'delete'
  | 'duplicate'

// Define notification strategies by operation type
const notificationStrategies = {
  create: async (
    dispatch: AppDispatch,
    wasActive: boolean,
    isNowActive: boolean,
    oldSession: BlockSession | null,
    newSession: BlockSession | null,
  ): Promise<void> => {
    if (isNowActive && newSession) {
      await sendStartNotification(dispatch, newSession)
    }
  },

  duplicate: async (
    dispatch: AppDispatch,
    wasActive: boolean,
    isNowActive: boolean,
    oldSession: BlockSession | null,
    newSession: BlockSession | null,
  ): Promise<void> => {
    if (isNowActive && newSession) {
      await sendStartNotification(dispatch, newSession)
    }
  },

  update: async (
    dispatch: AppDispatch,
    wasActive: boolean,
    isNowActive: boolean,
    oldSession: BlockSession | null,
    newSession: BlockSession | null,
  ): Promise<void> => {
    if (!wasActive && isNowActive && newSession) {
      // Became active
      await sendStartNotification(dispatch, newSession)
    } else if (wasActive && !isNowActive && newSession) {
      // Became inactive
      await sendEndNotification(dispatch, newSession)
    }
  },

  delete: async (
    dispatch: AppDispatch,
    wasActive: boolean,
    isNowActive: boolean,
    oldSession: BlockSession | null,
    newSession: BlockSession | null,
  ): Promise<void> => {
    if (wasActive && oldSession) {
      await sendEndNotification(dispatch, oldSession)
    }
  },
}

// Helper functions for sending notifications
async function sendStartNotification(
  dispatch: AppDispatch,
  session: BlockSession,
): Promise<void> {
  await dispatch(
    handleSessionStatusChange({
      sessionId: session.id,
      sessionName: session.name,
      isStart: true,
    }),
  )
}

async function sendEndNotification(
  dispatch: AppDispatch,
  session: BlockSession,
): Promise<void> {
  await dispatch(
    handleSessionStatusChange({
      sessionId: session.id,
      sessionName: session.name,
      isStart: false,
    }),
  )
}

export const handleSessionStatusChangeForCrud = async (
  dispatch: AppDispatch,
  dateProvider: DateProvider,
  oldSession: BlockSession | null,
  newSession: BlockSession | null,
  operation: NotificationCrudOperation,
): Promise<void> => {
  if (!oldSession && !newSession) {
    return
  }

  const wasActive = oldSession
    ? isSessionActive(dateProvider, oldSession)
    : false
  const isNowActive = newSession
    ? isSessionActive(dateProvider, newSession)
    : false

  // Execute the appropriate strategy based on operation type
  await notificationStrategies[operation](
    dispatch,
    wasActive,
    isNowActive,
    oldSession,
    newSession,
  )
}
