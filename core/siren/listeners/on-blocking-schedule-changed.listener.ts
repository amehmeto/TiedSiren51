import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { BlockingSchedule, SirenTier } from '@/core/_ports_/siren.tier'
import { AppStore } from '@/core/_redux_/createStore'
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
  // Creates a hash key from schedule to detect changes via string comparison
  const getScheduleKey = (schedule: BlockingSchedule[]): string => {
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

  const syncSchedule = async (
    schedule: BlockingSchedule[],
    wasActive: boolean,
    isActive: boolean,
  ) => {
    try {
      await sirenTier.updateBlockingSchedule(schedule)

      if (!wasActive && isActive) {
        sirenLookout.startWatching()
        await foregroundService.start()
      }

      if (wasActive && !isActive) {
        sirenLookout.stopWatching()
        await foregroundService.stop()
      }
    } catch (error) {
      logger.error(`[BlockingScheduleListener] ${error}`)
    }
  }

  // Sync initial state on app restart with active session
  const initialState = store.getState()
  const initialSchedule = selectBlockingSchedule(dateProvider, initialState)
  if (initialSchedule.length > 0) {
    lastScheduleKey = getScheduleKey(initialSchedule)
    void syncSchedule(initialSchedule, false, true)
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

    const schedule = selectBlockingSchedule(dateProvider, state)
    const scheduleKey = getScheduleKey(schedule)

    if (scheduleKey === lastScheduleKey) return

    const wasActive = lastScheduleKey !== ''
    const isActive = scheduleKey !== ''

    // Update state synchronously BEFORE async operations to prevent race conditions
    lastScheduleKey = scheduleKey

    void syncSchedule(schedule, wasActive, isActive)
  })
}
