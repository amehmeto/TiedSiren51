import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { BlockingSchedule, SirenTier } from '@/core/_ports_/siren.tier'
import { AppStore } from '@/core/_redux_/createStore'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'
import { selectBlockingSchedule } from '@/core/block-session/selectors/selectBlockingSchedule'

/**
 * Listens to block session changes and starts/stops the siren lookout accordingly.
 *
 * - When there are block sessions (active or scheduled): starts foreground service then watching
 * - When there are no block sessions: stops watching then foreground service
 *
 * Also syncs blocking schedule to native layer for native-to-native blocking:
 * - On protection start: syncs blocking schedule from active sessions
 * - On protection stop: clears blocking schedule
 * - On blocklist changes during active session: re-syncs
 *
 * The foreground service keeps the app alive in the background via a persistent notification.
 * This ensures the AccessibilityService subscription receives events even when app is backgrounded.
 *
 * Note: Async operations (foreground service, blocking schedule sync) are fire-and-forget
 * with errors caught and logged in their respective safe* wrapper functions.
 */
export const onBlockSessionsChangedListener = ({
  store,
  sirenLookout,
  sirenTier,
  foregroundService,
  dateProvider,
  logger,
}: {
  store: AppStore
  sirenLookout: SirenLookout
  sirenTier: SirenTier
  foregroundService: ForegroundService
  dateProvider: DateProvider
  logger: Logger
}): (() => void) => {
  const safeStartForegroundService = async () => {
    try {
      await foregroundService.start()
    } catch (error) {
      logger.error(`Failed to start foreground service: ${error}`)
    }
  }

  const safeStopForegroundService = async () => {
    try {
      await foregroundService.stop()
    } catch (error) {
      logger.error(`Failed to stop foreground service: ${error}`)
    }
  }

  const safeStartWatching = () => {
    try {
      sirenLookout.startWatching()
    } catch (error) {
      logger.error(`Failed to start watching: ${error}`)
    }
  }

  const safeStopWatching = () => {
    try {
      sirenLookout.stopWatching()
    } catch (error) {
      logger.error(`Failed to stop watching: ${error}`)
    }
  }

  const safeUpdateBlockingSchedule = async (schedule: BlockingSchedule[]) => {
    try {
      await sirenTier.updateBlockingSchedule(schedule)
    } catch (error) {
      logger.error(`Failed to update blocking schedule: ${error}`)
    }
  }

  const startProtection = async (schedule: BlockingSchedule[]) => {
    await safeUpdateBlockingSchedule(schedule)
    void safeStartForegroundService()
    safeStartWatching()
  }

  const stopProtection = async () => {
    await safeUpdateBlockingSchedule([])
    safeStopWatching()
    void safeStopForegroundService()
  }

  const getScheduleKey = (schedule: BlockingSchedule[]): string => {
    return schedule
      .map(
        (s) =>
          `${s.id}:${s.sirens.android.map((a) => a.packageName).join(',')}`,
      )
      .sort()
      .join('|')
  }

  let lastScheduleKey = ''

  const onAllSessionsRemoved = () => {
    void stopProtection()
    lastScheduleKey = ''
  }

  const onFirstSessionAdded = (schedule: BlockingSchedule[]) => {
    lastScheduleKey = getScheduleKey(schedule)
    void startProtection(schedule)
  }

  const onScheduleMayHaveChanged = (schedule: BlockingSchedule[]) => {
    const scheduleKey = getScheduleKey(schedule)
    if (scheduleKey === lastScheduleKey) return

    lastScheduleKey = scheduleKey
    void safeUpdateBlockingSchedule(schedule)
  }

  // Check initial state
  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)
  let didHaveSessions = initialSessions.length > 0

  if (didHaveSessions) {
    const schedule = selectBlockingSchedule(dateProvider, initialState)
    onFirstSessionAdded(schedule)
  }

  // Subscribe to store changes
  return store.subscribe(() => {
    const state = store.getState()
    const sessions = selectAllBlockSessions(state.blockSession)
    const hasSessions = sessions.length > 0
    const schedule = selectBlockingSchedule(dateProvider, state)

    if (didHaveSessions && !hasSessions) onAllSessionsRemoved()
    if (!didHaveSessions && hasSessions) onFirstSessionAdded(schedule)
    if (didHaveSessions && hasSessions) onScheduleMayHaveChanged(schedule)

    didHaveSessions = hasSessions
  })
}
