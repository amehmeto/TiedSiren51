import { expect } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block-session'
import { setBlockSessions } from '@/core/block-session/block-session.slice'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryForegroundService } from '@/infra/foreground-service/in-memory.foreground.service'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenLookout } from '@infra/siren-tier/in-memory.siren-lookout'

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

export function onBlockSessionsChangedFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  const dateProvider = new StubDateProvider()
  const sirenLookout = new InMemorySirenLookout()
  const foregroundService = new InMemoryForegroundService()
  const logger = new InMemoryLogger()

  let store: ReturnType<typeof createTestStore> | undefined

  const createStoreWithState = () => {
    store = createTestStore(
      { sirenLookout, foregroundService, dateProvider, logger },
      testStateBuilderProvider.getState(),
    )
    return store
  }

  return {
    given: {
      initialBlockSessions(sessions: BlockSession[]) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions(sessions),
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
    },
    when: {
      async blockSessionsChange(sessions: BlockSession[]) {
        const activeStore = store ?? createStoreWithState()
        activeStore.dispatch(setBlockSessions(sessions))
        await flushPromises()
      },
    },
    then: {
      blockedAppsShouldBeSyncedTo(expectedPackageNames: string[]) {
        expect(sirenLookout.lastSyncedApps.sort()).toEqual(
          expectedPackageNames.sort(),
        )
      },
      blockedAppsShouldBeEmpty() {
        expect(sirenLookout.lastSyncedApps).toEqual([])
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
    },
  }
}
