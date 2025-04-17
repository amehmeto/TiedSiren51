import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { BlockSession } from '@/core/block-session/block.session'
import { Sirens } from '@/core/siren/sirens'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { FakeDataSirensRepository } from '@/infra/sirens-repository/fake-data.sirens-repository'
import { describe, expect, test } from 'vitest'
import { loadUser } from './load-user.usecase'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'

describe('loadUser usecase', () => {
  test('should load user data from repositories', async () => {
    const mockBlocklists = [
      buildBlocklist({ id: 'blocklist-1', name: 'Test Blocklist' }),
    ]

    const mockBlockSessions = [buildBlockSession({ id: 'session-1' })]

    const mockSirens = buildSirens({
      websites: ['example.com'],
      keywords: ['test'],
    })

    const blocklistRepository = new FakeDataBlocklistRepository()
    const blockSessionRepository = new FakeDataBlockSessionRepository()
    const sirensRepository = new FakeDataSirensRepository()

    blocklistRepository.findAll = async () =>
      mockBlocklists as ReturnType<typeof buildBlocklist>[]
    blockSessionRepository.findAll = async () => mockBlockSessions
    sirensRepository.getSelectableSirens = async () => mockSirens

    const store = createTestStore({
      blocklistRepository,
      blockSessionRepository,
      sirensRepository,
    })

    await store.dispatch(loadUser())

    const state = store.getState()

    expect(state.blocklist.entities).toHaveProperty('blocklist-1')
    expect(state.blockSession.entities).toHaveProperty('session-1')
    expect(state.siren.availableSirens).toEqual(mockSirens)
  })

  test('should handle empty repositories', async () => {
    const emptyBlocklists: ReturnType<typeof buildBlocklist>[] = []
    const emptyBlockSessions: BlockSession[] = []
    const emptySirens: Sirens = {
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    }

    const blocklistRepository = new FakeDataBlocklistRepository()
    const blockSessionRepository = new FakeDataBlockSessionRepository()
    const sirensRepository = new FakeDataSirensRepository()

    blocklistRepository.findAll = async () => emptyBlocklists
    blockSessionRepository.findAll = async () => emptyBlockSessions
    sirensRepository.getSelectableSirens = async () => emptySirens

    const store = createTestStore({
      blocklistRepository,
      blockSessionRepository,
      sirensRepository,
    })

    await store.dispatch(loadUser())

    const state = store.getState()

    expect(Object.keys(state.blocklist.entities)).toHaveLength(0)
    expect(Object.keys(state.blockSession.entities)).toHaveLength(0)
    expect(state.siren.availableSirens).toEqual(emptySirens)
  })
})
