import { expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { dateFixture } from '@/core/_tests_/date.fixture'
import { Fixture } from '@/core/_tests_/fixture.types'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { BlockSession } from '@/core/block-session/block.session'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenTier } from '@infra/siren-tier/in-memory.siren-tier'
import { Sirens } from '../sirens'
import { targetSirens } from './target-sirens.usecase'

export function targetSirensFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): Fixture {
  const dateProvider = new StubDateProvider()
  const logger = new InMemoryLogger()
  const sirenTier = new InMemorySirenTier(logger)
  const dateTest = dateFixture(dateProvider)

  return {
    given: {
      activeBlockSessions(blockSessions: BlockSession[]) {
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions(blockSessions),
        )
      },
      ...dateTest.given,
    },
    when: {
      targetSirens() {
        const store: AppStore = createTestStore(
          { sirenTier, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(targetSirens())
      },
    },
    then: {
      sirensShouldTied(expectedSirens: Sirens) {
        expect(sirenTier.sirens).toStrictEqual(expectedSirens)
      },
    },
  }
}
