import { expect } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block-session'
import { setBlockSessions } from '@/core/block-session/block-session.slice'
import { Blocklist } from '@/core/blocklist/blocklist'
import { setBlocklists } from '@/core/blocklist/blocklist.slice'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryForegroundService } from '@/infra/foreground-service/in-memory.foreground.service'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenLookout } from '@infra/siren-tier/in-memory.siren-lookout'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'

export function blockingScheduleChangedFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  const dateProvider = new StubDateProvider()
  const sirenLookout = new InMemorySirenLookout()
  const logger = new InMemoryLogger()
  const sirenTier = new InMemorySirenTier(logger)
  const foregroundService = new InMemoryForegroundService()

  const dependencies = {
    sirenLookout,
    sirenTier,
    foregroundService,
    dateProvider,
    logger,
  }
  let store: ReturnType<typeof createTestStore> | undefined

  return {
    given: {
      existingBlockSessions(sessions: BlockSession[]) {
        const blocklists = sessions.flatMap((s) => s.blocklists)
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions(sessions).withBlocklists(blocklists),
        )
      },
      existingBlocklists(blocklists: Blocklist[]) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlocklists(blocklists),
        )
      },
      nowIs({ hours, minutes }: { hours: number; minutes: number }) {
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        dateProvider.now = date
      },
      updateBlockingScheduleWillThrow() {
        sirenTier.shouldThrowOnSync = true
      },
    },
    when: {
      async creatingBlockSessions(sessions: BlockSession[]) {
        store = createTestStore(
          dependencies,
          testStateBuilderProvider.getState(),
        )
        const blocklists = sessions.flatMap((s) => s.blocklists)
        store.dispatch(setBlocklists(blocklists))
        store.dispatch(setBlockSessions(sessions))
      },
      async updatingBlocklist(blocklist: Blocklist) {
        store = createTestStore(
          dependencies,
          testStateBuilderProvider.getState(),
        )
        const state = store.getState().blocklist
        const currentBlocklists = state.ids.map((id) => state.entities[id])

        const updatedBlocklists = currentBlocklists.map((b) =>
          b.id === blocklist.id ? blocklist : b,
        )
        store.dispatch(setBlocklists(updatedBlocklists))
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
        const hasExpectedError = errorLogs.some((log) =>
          log.message.includes(expectedMessage),
        )
        expect(hasExpectedError).toBe(true)
      },
      updateBlockingScheduleCallCount() {
        return sirenTier.updateCallCount
      },
    },
  }
}
