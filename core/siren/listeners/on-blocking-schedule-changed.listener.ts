import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { BlockingSchedule, SirenTier } from '@/core/_ports_/siren.tier'
import { AppStore } from '@/core/_redux_/createStore'
import { selectBlockingSchedule } from '@/core/block-session/selectors/selectBlockingSchedule'
import { selectHasActiveSession } from '@/core/block-session/selectors/selectHasActiveSession'

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
  let isActiveNow = false

  const syncSchedule = async (
    schedule: BlockingSchedule[],
    wasActiveBefore: boolean,
    hasActiveSessionNow: boolean,
  ) => {
    try {
      await sirenTier.updateBlockingSchedule(schedule)

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

  const initialState = store.getState()
  const initialSchedule = selectBlockingSchedule(dateProvider, initialState)
  const hasActiveOnInit = selectHasActiveSession(dateProvider, initialState)
  if (initialSchedule.length > 0) {
    lastScheduleKey = getScheduleHashKey(initialSchedule)
    const wasActiveBefore = isActiveNow
    isActiveNow = hasActiveOnInit
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

    const schedule = selectBlockingSchedule(dateProvider, state)
    const hasActiveSession = selectHasActiveSession(dateProvider, state)
    const scheduleKey = getScheduleHashKey(schedule)

    if (scheduleKey === lastScheduleKey) return

    lastScheduleKey = scheduleKey
    const wasActiveBefore = isActiveNow
    isActiveNow = hasActiveSession

    void syncSchedule(schedule, wasActiveBefore, hasActiveSession)
  })
}
