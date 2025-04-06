import {
  stateBuilderProvider,
  StateBuilderProvider,
} from '@/core/_tests_/state-builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { dependencies } from '@/ui/dependencies'

// This function is used for manual testing with predefined state
export async function preloadedStateForManualTesting() {
  const { dateProvider, blocklistRepository, blockSessionRepository } =
    dependencies
  const blocklists = await blocklistRepository.findAll()

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
  ;(blockSessionRepository as FakeDataBlockSessionRepository).entities =
    new Map(
      preloadedBlockSessions.map((blockSession) => [
        blockSession.id,
        blockSession,
      ]),
    )
  return preloadedState
}
