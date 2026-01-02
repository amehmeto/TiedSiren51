import { expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { dateFixture } from '@/core/_tests_/date.fixture'
import { Fixture } from '@/core/_tests_/fixture.type'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block-session'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'
import { blockLaunchedApp } from './block-launched-app.usecase'

export function blockLaunchedAppFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): Fixture {
  const dateProvider = new StubDateProvider()
  const logger = new InMemoryLogger()
  const sirenTier = new InMemorySirenTier(logger)
  const dateTest = dateFixture(dateProvider)

  return {
    given: {
      activeBlockSession(blockSession: BlockSession) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions([blockSession]),
        )
      },
      ...dateTest.given,
    },
    when: {
      appLaunched(packageName: string) {
        const store: AppStore = createTestStore(
          { sirenTier, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(blockLaunchedApp({ packageName }))
      },
    },
    then: {
      appShouldBeBlocked(packageName: string) {
        const hasApp = sirenTier.schedules.some((schedule) =>
          schedule.sirens.android.some(
            (app) => app.packageName === packageName,
          ),
        )
        expect(hasApp).toBe(true)
      },
      appShouldNotBeBlocked(packageName: string) {
        const hasApp = sirenTier.schedules.some((schedule) =>
          schedule.sirens.android.some(
            (app) => app.packageName === packageName,
          ),
        )
        expect(hasApp).toBe(false)
      },
      noAppShouldBeBlocked() {
        expect(sirenTier.schedules).toHaveLength(0)
      },
    },
  }
}
