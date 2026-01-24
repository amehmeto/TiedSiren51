import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { BlockingSchedule, SirenTier } from '@/core/_ports_/siren.tier'
import { AppStore } from '@/core/_redux_/createStore'
import { selectBlockingScheduleWithActiveFlag } from '@/core/block-session/selectors/selectBlockingScheduleWithActiveFlag'

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
  // Creates a hash key from schedule to detect changes via string comparison
  const getScheduleHashKey = (schedule: BlockingSchedule[]): string => {
    return schedule
      .map((s) => {
        return [
          s.id,
          s.startTime,
          s.endTime,
          s.sirens.android.map((a) => a.packageName).join(','),
          s.sirens.ios.join(','),
          s.sirens.macos.join(','),
          s.sirens.windows.join(','),
          s.sirens.linux.join(','),
          s.sirens.websites.join(','),
          s.sirens.keywords.join(','),
        ].join(':')
      })
      .sort()
      .join('|')
  }

  let lastScheduleKey = ''
  let lastBlockSessionState = store.getState().blockSession
  let lastBlocklistState = store.getState().blocklist
  let wasActiveNow = false

  const syncSchedule = async (
    schedule: BlockingSchedule[],
    wasActiveBefore: boolean,
    hasActiveSessionNow: boolean,
  ) => {
    try {
      await sirenTier.updateBlockingSchedule(schedule)

      // Start/stop foreground service based on whether sessions are ACTIVE now
      if (!wasActiveBefore && hasActiveSessionNow) {
        sirenLookout.startWatching()
        await foregroundService.start()
      }

      if (wasActiveBefore && !hasActiveSessionNow) {
        sirenLookout.stopWatching()
        await foregroundService.stop()
      }
    } catch (error) {
      logger.error(`[BlockingScheduleListener] ${error}`)
    }
  }

  // Initial sync on listener registration
  const initialState = store.getState()
  const { schedule: initialSchedule, hasActiveSession: hasActiveOnInit } =
    selectBlockingScheduleWithActiveFlag(dateProvider, initialState)
  if (initialSchedule.length > 0) {
    lastScheduleKey = getScheduleHashKey(initialSchedule)
    // Update state synchronously BEFORE async operations to prevent race conditions
    const wasActiveBefore = wasActiveNow
    wasActiveNow = hasActiveOnInit
    void syncSchedule(initialSchedule, wasActiveBefore, hasActiveOnInit)
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

    const { schedule, hasActiveSession } = selectBlockingScheduleWithActiveFlag(
      dateProvider,
      state,
    )
    const scheduleKey = getScheduleHashKey(schedule)

    if (scheduleKey === lastScheduleKey) return

    // Update state synchronously BEFORE async operations to prevent race conditions
    lastScheduleKey = scheduleKey
    const wasActiveBefore = wasActiveNow
    wasActiveNow = hasActiveSession

    void syncSchedule(schedule, wasActiveBefore, hasActiveSession)
  })
}
