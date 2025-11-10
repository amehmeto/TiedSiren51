import { expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block.session'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemorySirenTier } from '@/infra/siren-tier/in-memory-siren.tier'
import { Sirens } from '../sirens'
import { tieSirens } from './tie-sirens.usecase'

export function tieSirensFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  const sirenTier = new InMemorySirenTier()
  const dateProvider = new StubDateProvider()

  return {
    given: {
      activeBlockSessions(blockSessions: BlockSession[]) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions(blockSessions),
        )
      },
      nowIs({ hours, minutes }: { hours: number; minutes: number }) {
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        dateProvider.now = date
      },
    },
    when: {
      tieSirens() {
        const store: AppStore = createTestStore(
          { sirenTier, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(tieSirens())
      },
    },
    then: {
      sirensShouldTied(expectedSirens: Sirens) {
        expect(sirenTier.sirens).toStrictEqual(expectedSirens)
      },
    },
  }
}
