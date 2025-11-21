import { expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block.session'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'
import { blockLaunchedApp } from './block-launched-app.usecase'

export function blockLaunchedAppFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  const sirenTier = new InMemorySirenTier()
  const dateProvider = new StubDateProvider()

  return {
    given: {
      activeBlockSession(blockSession: BlockSession) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions([blockSession]),
        )
      },
      nowIs({ hours, minutes }: { hours: number; minutes: number }) {
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        dateProvider.now = date
      },
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
        expect(sirenTier.blockedApps).toContain(packageName)
      },
      appShouldNotBeBlocked(packageName: string) {
        expect(sirenTier.blockedApps).not.toContain(packageName)
      },
      noAppShouldBeBlocked() {
        expect(sirenTier.blockedApps).toHaveLength(0)
      },
    },
  }
}
