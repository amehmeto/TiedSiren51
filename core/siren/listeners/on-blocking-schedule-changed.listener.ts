import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { BlockingSchedule, SirenTier } from '@/core/_ports_/siren.tier'
import { AppStore } from '@/core/_redux_/createStore'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'
import { selectBlockingSchedule } from '@/core/block-session/selectors/selectBlockingSchedule'

export const onBlockingScheduleChangedListener = ({
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
      .map((s) => {
        return `${s.id}:${s.startTime}:${s.endTime}:${s.sirens.android.map((a) => a.packageName).join(',')}:${s.sirens.websites.join(',')}:${s.sirens.keywords.join(',')}`
      })
      .sort()
      .join('|')
  }

  let lastScheduleKey = ''
  let lastBlockSessionState = store.getState().blockSession
  let lastBlocklistState = store.getState().blocklist

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

  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)
  let didHaveSessions = initialSessions.length > 0

  if (didHaveSessions) {
    const schedule = selectBlockingSchedule(dateProvider, initialState)
    onFirstSessionAdded(schedule)
  }

  return store.subscribe(() => {
    const state = store.getState()

    if (
      state.blockSession === lastBlockSessionState &&
      state.blocklist === lastBlocklistState
    )
      return

    lastBlockSessionState = state.blockSession
    lastBlocklistState = state.blocklist

    const sessions = selectAllBlockSessions(state.blockSession)
    const hasSessions = sessions.length > 0

    if (didHaveSessions && !hasSessions) onAllSessionsRemoved()
    else if (hasSessions) {
      const schedule = selectBlockingSchedule(dateProvider, state)
      if (!didHaveSessions) onFirstSessionAdded(schedule)
      else onScheduleMayHaveChanged(schedule)
    }

    didHaveSessions = hasSessions
  })
}
