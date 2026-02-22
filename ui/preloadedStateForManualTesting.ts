import { createStore } from '@/core/_redux_/createStore'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  stateBuilderProvider,
  StateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { dependencies } from '@/ui/dependencies'

export async function preloadedStateForManualTesting() {
  const { dateProvider, blocklistRepository, blockSessionRepository } =
    dependencies
  const blocklists = await blocklistRepository.findAll('manual-testing-user')

  const preloadedState: StateBuilderProvider = stateBuilderProvider()
  const preloadedBlockSessions = [
    buildBlockSession({
      name: 'Working time',
      startedAt: dateProvider.getHHmmMinutesFromNow(0),
      endedAt: dateProvider.getHHmmMinutesFromNow(1),
    }),
    buildBlockSession({
      name: 'Sleeping time',
      startedAt: dateProvider.getHHmmMinutesFromNow(1),
    }),
    buildBlockSession({
      name: 'Break time',
      startedAt: dateProvider.getHHmmMinutesFromNow(5),
      endedAt: dateProvider.getHHmmMinutesFromNow(10),
    }),
  ]
  preloadedState.setState((builder) =>
    builder
      .withBlockSessions(preloadedBlockSessions)
      .withBlocklists(blocklists),
  )

  if (blockSessionRepository instanceof FakeDataBlockSessionRepository) {
    const blockSessionEntries = preloadedBlockSessions.map(
      (blockSession) => [blockSession.id, blockSession] as const,
    )
    blockSessionRepository.entities = new Map(blockSessionEntries)
  }

  return preloadedState
}

/*export const storePromise = preloadedStateForManualTesting().then(
  (preloadedState) => createStore(dependencies, preloadedState.getState()),
)*/

export const store = createStore(dependencies)
export const storePromise = Promise.resolve(store)
