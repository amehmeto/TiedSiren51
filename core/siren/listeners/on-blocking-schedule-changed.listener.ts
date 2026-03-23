import { DateProvider, ISODateString } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import {
  SirenLookout,
  isAndroidSirenLookout,
} from '@/core/_ports_/siren.lookout'
import { BlockingSchedule, SirenTier } from '@/core/_ports_/siren.tier'
import { AppStore } from '@/core/_redux_/createStore'
import { selectBlockingSchedule } from '@/core/block-session/selectors/selectBlockingSchedule'
import { selectHasActiveSession } from '@/core/block-session/selectors/selectHasActiveSession'

type BlockingScheduleListenerDependencies = {
  store: AppStore
  sirenLookout: SirenLookout
  sirenTier: SirenTier
  foregroundService: ForegroundService
  dateProvider: DateProvider
  logger: Logger
}

export const onBlockingScheduleChangedListener = ({
  store,
  sirenLookout,
  sirenTier,
  foregroundService,
  dateProvider,
  logger,
}: BlockingScheduleListenerDependencies): (() => void) => {
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

      // Schedule native-side alarms for future window transitions.
      // This ensures the foreground service starts/stops at the right time
      // even if the JS runtime is killed.
      const toHHmm = (iso: ISODateString) =>
        dateProvider.toHHmm(dateProvider.parseISOString(iso))
      const activeWindows = schedule.map((s) => ({
        startTime: toHHmm(s.startTime),
        endTime: toHHmm(s.endTime),
      }))

      await foregroundService.setActiveWindows(activeWindows)

      // Start watching preemptively for future windows so the JS accessibility
      // listener is ready when the native AlarmManager starts the service.
      if (!hasActiveSessionNow && activeWindows.length > 0) {
        const now = dateProvider.getNow()
        const hasFutureWindow = schedule.some(
          (s) => dateProvider.parseISOString(s.endTime) > now,
        )
        if (hasFutureWindow) sirenLookout.startWatching()
      }
    } catch (error) {
      logger.error(`[BlockingScheduleListener] ${error}`)
    }
  }

  // Listen for native service starts (e.g., from AlarmManager active window).
  // When the service starts natively, we need to:
  // 1. Ensure the JS accessibility listener is active (startWatching)
  // 2. Detect the currently-foreground app (detectCurrentApp)
  //    since TYPE_WINDOW_STATE_CHANGED doesn't fire for already-visible apps
  const unsubscribeServiceState = foregroundService.addServiceStateListener(
    (isRunning) => {
      if (!isRunning) return
      const hasActive = selectHasActiveSession(dateProvider, store.getState())
      if (!hasActive) return

      sirenLookout.startWatching()
      if (isAndroidSirenLookout(sirenLookout))
        void sirenLookout.detectCurrentApp()
    },
  )

  const initialState = store.getState()
  const initialSchedule = selectBlockingSchedule(dateProvider, initialState)
  const hasActiveOnInit = selectHasActiveSession(dateProvider, initialState)
  if (initialSchedule.length > 0) {
    lastScheduleKey = getScheduleHashKey(initialSchedule)
    // Update state synchronously BEFORE async operations to prevent race conditions
    const wasActiveBefore = isActiveNow
    isActiveNow = hasActiveOnInit
    void syncSchedule(initialSchedule, wasActiveBefore, hasActiveOnInit)
  }

  const unsubscribeStore = store.subscribe(() => {
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

    // Update state synchronously BEFORE async operations to prevent race conditions
    lastScheduleKey = scheduleKey
    const wasActiveBefore = isActiveNow
    isActiveNow = hasActiveSession

    void syncSchedule(schedule, wasActiveBefore, hasActiveSession)
  })

  /* v8 ignore next 4 -- cleanup function only called on unmount */
  return () => {
    unsubscribeServiceState()
    unsubscribeStore()
  }
}
