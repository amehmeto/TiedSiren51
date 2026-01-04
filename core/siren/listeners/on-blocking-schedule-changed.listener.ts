/* eslint-disable local-rules/listener-error-handling */
import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
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
}: {
  store: AppStore
  sirenLookout: SirenLookout
  sirenTier: SirenTier
  foregroundService: ForegroundService
  dateProvider: DateProvider
}): (() => void) => {
  const getScheduleKey = (schedule: BlockingSchedule[]): string => {
    return schedule
      .map((s) => {
        return `${s.id}:${s.startTime}:${s.endTime}:${s.sirens.android.map((a) => a.packageName).join(',')}:${s.sirens.ios.join(',')}:${s.sirens.macos.join(',')}:${s.sirens.windows.join(',')}:${s.sirens.linux.join(',')}:${s.sirens.websites.join(',')}:${s.sirens.keywords.join(',')}`
      })
      .sort()
      .join('|')
  }

  const startProtection = async (schedule: BlockingSchedule[]) => {
    await sirenTier.updateBlockingSchedule(schedule)
    sirenLookout.startWatching()
    await foregroundService.start()
  }

  const stopProtection = async () => {
    await sirenTier.updateBlockingSchedule([])
    sirenLookout.stopWatching()
    await foregroundService.stop()
  }

  let lastScheduleKey = ''
  let lastBlockSessionState = store.getState().blockSession
  let lastBlocklistState = store.getState().blocklist

  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)
  let didHaveSessions = initialSessions.length > 0

  if (didHaveSessions) {
    const schedule = selectBlockingSchedule(dateProvider, initialState)
    lastScheduleKey = getScheduleKey(schedule)
    void startProtection(schedule)
  }

  return store.subscribe(() => {
    void (async () => {
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

      if (didHaveSessions && !hasSessions) {
        await stopProtection()
        lastScheduleKey = ''
      } else if (hasSessions) {
        const schedule = selectBlockingSchedule(dateProvider, state)
        if (!didHaveSessions) {
          lastScheduleKey = getScheduleKey(schedule)
          await startProtection(schedule)
        } else {
          const scheduleKey = getScheduleKey(schedule)
          if (scheduleKey !== lastScheduleKey) {
            lastScheduleKey = scheduleKey
            await sirenTier.updateBlockingSchedule(schedule)
          }
        }
      }

      didHaveSessions = hasSessions
    })()
  })
}
