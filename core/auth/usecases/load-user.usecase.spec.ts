import { beforeEach, describe, expect, test } from 'vitest'
import { DatabaseService } from '@/core/_ports_/database.service'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { StubDatabaseService } from '@/infra/database-service/stub.database.service'
import { InMemoryOrphanClaimFlagStorage } from '@/infra/orphan-claim-flag/in-memory.orphan-claim-flag.storage'
import { FakeDataSirensRepository } from '@/infra/siren-repository/fake-data.sirens-repository'
import { loadUser } from './load-user.usecase'

function createClaimCountingDatabaseService(): DatabaseService & {
  claimOrphanedRowsCallCount: number
} {
  let count = 0
  const stub = new StubDatabaseService()
  return {
    getDbPath: () => stub.getDbPath(),
    getDatabase: () => stub.getDatabase(),
    initialize: () => stub.initialize(),
    async claimOrphanedRows(userId: string) {
      count++
      await stub.claimOrphanedRows(userId)
    },
    get claimOrphanedRowsCallCount() {
      return count
    },
  }
}

const preloadedStateWithAuth = stateBuilder()
  .withAuthUser({
    id: 'test-user-id',
    email: 'test@example.com',
    isEmailVerified: true,
    authProvider: AuthProvider.Email,
  })
  .build()

describe('loadUser usecase', () => {
  let blocklistRepository: FakeDataBlocklistRepository
  let blockSessionRepository: FakeDataBlockSessionRepository
  let sirensRepository: FakeDataSirensRepository
  let claimCountingDb: ReturnType<typeof createClaimCountingDatabaseService>
  let orphanClaimFlagStorage: InMemoryOrphanClaimFlagStorage

  beforeEach(() => {
    blocklistRepository = new FakeDataBlocklistRepository()
    blockSessionRepository = new FakeDataBlockSessionRepository()
    sirensRepository = new FakeDataSirensRepository()
    claimCountingDb = createClaimCountingDatabaseService()
    orphanClaimFlagStorage = new InMemoryOrphanClaimFlagStorage()
  })

  test('should load user data from repositories', async () => {
    const mockBlocklists: ReturnType<typeof buildBlocklist>[] = [
      buildBlocklist({ id: 'blocklist-1', name: 'Test Blocklist' }),
    ]

    const mockBlockSessions = [buildBlockSession({ id: 'session-1' })]

    const mockSirens = buildSirens({
      websites: ['example.com'],
      keywords: ['test'],
    })

    blocklistRepository.findAll = async () => mockBlocklists
    blockSessionRepository.findAll = async () => mockBlockSessions
    sirensRepository.getSelectableSirens = async () => mockSirens

    const store = createTestStore(
      {
        blocklistRepository,
        blockSessionRepository,
        sirensRepository,
      },
      preloadedStateWithAuth,
    )

    await store.dispatch(loadUser())

    const { blocklist, blockSession, siren } = store.getState()
    const blocklistEntities = blocklist.entities
    const blockSessionEntities = blockSession.entities
    const availableSirens = siren.availableSirens

    expect(blocklistEntities).toHaveProperty('blocklist-1')
    expect(blockSessionEntities).toHaveProperty('session-1')
    expect(availableSirens).toStrictEqual(mockSirens)
  })

  test('should call claimOrphanedRows only once (run-once migration flag)', async () => {
    blocklistRepository.findAll = async () => []
    blockSessionRepository.findAll = async () => []
    sirensRepository.getSelectableSirens = async () => buildSirens()

    const store = createTestStore(
      {
        blocklistRepository,
        blockSessionRepository,
        sirensRepository,
        databaseService: claimCountingDb,
        orphanClaimFlagStorage,
      },
      preloadedStateWithAuth,
    )

    await store.dispatch(loadUser())
    const countAfterFirstLoad = claimCountingDb.claimOrphanedRowsCallCount
    expect(countAfterFirstLoad).toBe(1)

    await store.dispatch(loadUser())
    const countAfterSecondLoad = claimCountingDb.claimOrphanedRowsCallCount
    expect(countAfterSecondLoad).toBe(1)
  })

  test('should handle empty repositories', async () => {
    const emptyBlocklists: ReturnType<typeof buildBlocklist>[] = []
    const emptyBlockSessions: ReturnType<typeof buildBlockSession>[] = []
    const emptySirens = buildSirens()

    blocklistRepository.findAll = async () => emptyBlocklists
    blockSessionRepository.findAll = async () => emptyBlockSessions
    sirensRepository.getSelectableSirens = async () => emptySirens

    const store = createTestStore(
      {
        blocklistRepository,
        blockSessionRepository,
        sirensRepository,
      },
      preloadedStateWithAuth,
    )

    await store.dispatch(loadUser())

    const { blocklist, blockSession, siren } = store.getState()
    const blocklistEntities = blocklist.entities
    const blockSessionEntities = blockSession.entities
    const availableSirens = siren.availableSirens

    const blocklistKeys = Object.keys(blocklistEntities)
    const blockSessionKeys = Object.keys(blockSessionEntities)

    expect(blocklistKeys).toHaveLength(0)
    expect(blockSessionKeys).toHaveLength(0)
    expect(availableSirens).toStrictEqual(emptySirens)
  })
})
