import { expect } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block-session'
import { setBlockSessions } from '@/core/block-session/block-session.slice'
import { Blocklist } from '@/core/blocklist/blocklist'
import { setBlocklists } from '@/core/blocklist/blocklist.slice'
import { setEndedAt } from '@/core/strict-mode/strict-mode.slice'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryForegroundService } from '@/infra/foreground-service/in-memory.foreground.service'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenLookout } from '@infra/siren-tier/in-memory.siren-lookout'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

export function blockingScheduleChangedFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  const dateProvider = new StubDateProvider()
  const sirenLookout = new InMemorySirenLookout()
  const logger = new InMemoryLogger()
  const sirenTier = new InMemorySirenTier(logger)
  const foregroundService = new InMemoryForegroundService()

  let store: ReturnType<typeof createTestStore> | undefined

  const createStoreWithState = () => {
    store = createTestStore(
      { sirenLookout, sirenTier, foregroundService, dateProvider, logger },
      testStateBuilderProvider.getState(),
    )
    return store
  }

  return {
    given: {
      initialBlockSessions(sessions: BlockSession[]) {
        testStateBuilderProvider.setState((builder) =>
          builder
            .withBlockSessions(sessions)
            .withBlocklists(sessions.flatMap((s) => s.blocklists)),
        )
      },
      initialBlocklists(blocklists: Blocklist[]) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlocklists(blocklists),
        )
      },
      storeIsCreated() {
        createStoreWithState()
      },
      nowIs({ hours, minutes }: { hours: number; minutes: number }) {
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        dateProvider.now = date
      },
      startWatchingWillThrow() {
        sirenLookout.shouldThrowOnStart = true
      },
      stopWatchingWillThrow() {
        sirenLookout.shouldThrowOnStop = true
      },
      updateBlockingScheduleWillThrow() {
        sirenTier.shouldThrowOnSync = true
      },
      startForegroundServiceWillThrow() {
        foregroundService.shouldThrowOnStart = true
      },
      stopForegroundServiceWillThrow() {
        foregroundService.shouldThrowOnStop = true
      },
    },
    when: {
      async blockSessionsChange(sessions: BlockSession[]) {
        const activeStore = store ?? createStoreWithState()
        activeStore.dispatch(
          setBlocklists(sessions.flatMap((s) => s.blocklists)),
        )
        activeStore.dispatch(setBlockSessions(sessions))
        await flushPromises()
      },
      async blocklistIsUpdated(blocklist: Blocklist) {
        const activeStore = store ?? createStoreWithState()
        const state = activeStore.getState().blocklist
        const currentBlocklists = state.ids.map((id) => state.entities[id])

        const updatedBlocklists = currentBlocklists.map((b) =>
          b.id === blocklist.id ? blocklist : b,
        )
        activeStore.dispatch(setBlocklists(updatedBlocklists))
        await flushPromises()
      },
      async unrelatedStateChanges() {
        const activeStore = store ?? createStoreWithState()
        activeStore.dispatch(setEndedAt('2024-01-01T12:00:00.000Z'))
        await flushPromises()
      },
    },
    then: {
      blockingScheduleShouldContainApps(expectedPackageNames: string[]) {
        const syncedPackages = sirenTier.schedules.flatMap((s) =>
          s.sirens.android.map((app) => app.packageName),
        )
        expect(syncedPackages.sort()).toEqual(expectedPackageNames.sort())
      },
      blockingScheduleShouldContainWebsites(expectedWebsites: string[]) {
        const syncedWebsites = sirenTier.schedules.flatMap(
          (s) => s.sirens.websites,
        )
        expect(syncedWebsites.sort()).toEqual(expectedWebsites.sort())
      },
      blockingScheduleShouldContainKeywords(expectedKeywords: string[]) {
        const syncedKeywords = sirenTier.schedules.flatMap(
          (s) => s.sirens.keywords,
        )
        expect(syncedKeywords.sort()).toEqual(expectedKeywords.sort())
      },
      blockingScheduleShouldBeEmpty() {
        expect(sirenTier.schedules).toEqual([])
      },
      watchingShouldBeStarted() {
        expect(sirenLookout.isWatching).toBe(true)
      },
      watchingShouldBeStopped() {
        expect(sirenLookout.isWatching).toBe(false)
      },
      foregroundServiceShouldBeStarted() {
        expect(foregroundService.isRunning()).toBe(true)
      },
      foregroundServiceShouldBeStopped() {
        expect(foregroundService.isRunning()).toBe(false)
      },
      errorShouldBeLogged(expectedMessage: string) {
        const errorLogs = logger
          .getLogs()
          .filter((log) => log.level === 'error')
        expect(
          errorLogs.some((log) => log.message.includes(expectedMessage)),
        ).toBe(true)
      },
      updateBlockingScheduleCallCount() {
        return sirenTier.updateCallCount
      },
    },
  }
}
