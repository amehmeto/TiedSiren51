/* eslint-disable no-console */
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { BlockSession } from '../block.session'

// A map to track notifications sent to avoid duplicates
// We store this outside to persist across calls
const notifiedSessionsMap = new Map<string, { start: boolean; end: boolean }>()

// Debug tracker to log notification activity
const debugNotifications = {
  sessionChecks: 0,
  notificationsSent: 0,
  lastNotificationTime: 0,
  lastNotificationMessage: '',
  duplicatesPrevented: 0,
}

/**
 * Payload for sending a session status notification
 */
export type SessionStatusPayload = {
  sessionId: string
  sessionName: string
  isStart: boolean // true for start notification, false for end notification
}

/**
 * Usecase for handling session status changes and sending real-time notifications
 * This is used whenever a session starts or ends to send a notification
 * It tracks which notifications have been sent to prevent duplicates
 */
export const handleSessionStatusChange = createAppAsyncThunk(
  'blockSession/handleSessionStatusChange',
  async (payload: SessionStatusPayload, { extra: { notificationService } }) => {
    const { sessionId, sessionName, isStart } = payload
    console.log(`[Notification Check] ${sessionName} - isStart: ${isStart}`)

    // Get any existing notification status for this session
    const sessionStatus = notifiedSessionsMap.get(sessionId) || {
      start: false,
      end: false,
    }

    // Log current status
    console.log(
      `[Notification Status] ${sessionName} - current status:`,
      sessionStatus,
    )

    // Determine if we should send a notification
    const shouldSendNotification = isStart
      ? !sessionStatus.start
      : !sessionStatus.end

    if (shouldSendNotification) {
      const notificationMessage = isStart
        ? `Session "${sessionName}" has started`
        : `Session "${sessionName}" has ended`

      // Check if notification was sent very recently (within 5 seconds)
      const now = Date.now()
      const timeSinceLastNotification =
        now - debugNotifications.lastNotificationTime

      if (
        timeSinceLastNotification < 5000 &&
        debugNotifications.lastNotificationMessage === notificationMessage
      ) {
        console.log(
          `[Notification Prevented] ${notificationMessage} - too soon after previous notification (${timeSinceLastNotification}ms)`,
        )
        debugNotifications.duplicatesPrevented++
        return {
          sessionId,
          notificationSent: false,
          notificationType: isStart ? 'start' : 'end',
          reason: 'rate-limited',
        }
      }

      // Send the notification with a 1 second delay
      console.log(`[Notification Sending] ${notificationMessage}`)
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        notificationMessage,
        { seconds: 1 },
      )

      // Update tracking data
      debugNotifications.notificationsSent++
      debugNotifications.lastNotificationTime = now
      debugNotifications.lastNotificationMessage = notificationMessage

      // Update the notification status map
      notifiedSessionsMap.set(sessionId, {
        ...sessionStatus,
        start: isStart ? true : sessionStatus.start,
        end: isStart ? sessionStatus.end : true,
      })

      console.log(`[Notification Sent] ${notificationMessage}`)

      return {
        sessionId,
        notificationSent: true,
        notificationType: isStart ? 'start' : 'end',
      }
    } else {
      console.log(
        `[Notification Skipped] ${sessionName} - already sent notification for ${isStart ? 'start' : 'end'}`,
      )
      debugNotifications.duplicatesPrevented++
    }

    return {
      sessionId,
      notificationSent: false,
      notificationType: isStart ? 'start' : 'end',
      reason: 'already-sent',
    }
  },
)

/**
 * Helper function to determine if a session is active based on its times
 */
export const isSessionActive = (
  dateProvider: any,
  session: BlockSession,
): boolean => {
  const start = dateProvider.recoverDate(session.startedAt)
  const end = dateProvider.recoverDate(session.endedAt)
  const now = dateProvider.getNow()

  return now >= start && now < end
}

/**
 * Helper to check which sessions have just become active or inactive
 * and dispatch the appropriate notifications
 */
export const checkAndNotifySessionChanges = async (
  dispatch: any,
  dateProvider: any,
  sessions: BlockSession[],
): Promise<void> => {
  const now = dateProvider.getNow()
  debugNotifications.sessionChecks++

  // Add rate limiting - only check every 2 seconds to reduce frequency
  if (debugNotifications.sessionChecks % 2 !== 0) {
    return
  }

  // Debug log
  if (debugNotifications.sessionChecks % 10 === 0) {
    console.log(
      `[Notification Stats] Checks: ${debugNotifications.sessionChecks}, Sent: ${debugNotifications.notificationsSent}, Prevented: ${debugNotifications.duplicatesPrevented}`,
    )
  }

  // Find sessions that should trigger notifications
  const sessionsToNotify: {
    session: BlockSession
    isStart: boolean
  }[] = []

  for (const session of sessions) {
    const start = dateProvider.recoverDate(session.startedAt)
    const end = dateProvider.recoverDate(session.endedAt)

    // Check if the session just started (within the last few seconds)
    const justStarted =
      now >= start &&
      now < end && // Must still be active
      Math.abs(now.getTime() - start.getTime()) < 5000 // Within 5 seconds

    // Check if the session just ended (within the last few seconds)
    const justEnded =
      now >= end && Math.abs(now.getTime() - end.getTime()) < 5000 // Within 5 seconds

    if (justStarted) {
      sessionsToNotify.push({ session, isStart: true })
    }

    if (justEnded) {
      sessionsToNotify.push({ session, isStart: false })
    }
  }

  // Only dispatch notifications if we have any to send
  // This prevents unnecessary executions
  if (sessionsToNotify.length > 0) {
    console.log(
      `[Notification Check] Found ${sessionsToNotify.length} sessions needing notifications`,
    )

    // Process notifications one at a time
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

/**
 * Helper function to handle session status changes for CRUD operations
 * This provides a consistent way for all usecases to handle notifications
 */
export const handleSessionStatusChangeForCrud = async (
  dispatch: any,
  dateProvider: any,
  oldSession: BlockSession | null,
  newSession: BlockSession | null,
  operation: 'create' | 'update' | 'delete' | 'duplicate',
): Promise<void> => {
  // If both sessions are null, there's nothing to do
  if (!oldSession && !newSession) {
    return
  }

  const wasActive = oldSession
    ? isSessionActive(dateProvider, oldSession)
    : false
  const isNowActive = newSession
    ? isSessionActive(dateProvider, newSession)
    : false

  console.log(
    `[${operation.toUpperCase()}] Session status check - was active: ${wasActive}, is now active: ${isNowActive}`,
  )

  // Handle session creation or duplication
  if ((operation === 'create' || operation === 'duplicate') && newSession) {
    if (isNowActive) {
      // New active session
      await dispatch(
        handleSessionStatusChange({
          sessionId: newSession.id,
          sessionName: newSession.name,
          isStart: true,
        }),
      )
    }
  }

  // Handle session update
  else if (operation === 'update' && oldSession && newSession) {
    // Session became active
    if (!wasActive && isNowActive) {
      await dispatch(
        handleSessionStatusChange({
          sessionId: newSession.id,
          sessionName: newSession.name,
          isStart: true,
        }),
      )
    }

    // Session became inactive
    else if (wasActive && !isNowActive) {
      await dispatch(
        handleSessionStatusChange({
          sessionId: newSession.id,
          sessionName: newSession.name,
          isStart: false,
        }),
      )
    }
  }

  // Handle session deletion
  else if (operation === 'delete' && oldSession) {
    // If a session was active and is being deleted, send an end notification
    if (wasActive) {
      await dispatch(
        handleSessionStatusChange({
          sessionId: oldSession.id,
          sessionName: oldSession.name,
          isStart: false,
        }),
      )
    }
  }
}
