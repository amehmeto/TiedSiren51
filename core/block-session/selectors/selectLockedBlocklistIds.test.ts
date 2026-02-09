import { beforeEach, describe, expect, test } from 'vitest'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectLockedBlocklistIds } from './selectLockedBlocklistIds'

describe('selectLockedBlocklistIds', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('returns empty array when there are no sessions', () => {
    const state = stateBuilder().build()

    const retrievedBlocklistIds = selectLockedBlocklistIds(state, dateProvider)

    expect(retrievedBlocklistIds).toStrictEqual([])
  })

  test('returns blocklist ids from active sessions', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const activeSession = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['blocklist-1', 'blocklist-2'],
    })
    const state = stateBuilder().withBlockSessions([activeSession]).build()

    const retrievedBlocklistIds = selectLockedBlocklistIds(state, dateProvider)

    expect(retrievedBlocklistIds).toContain('blocklist-1')
    expect(retrievedBlocklistIds).toContain('blocklist-2')
  })

  test('returns blocklist ids from scheduled sessions', () => {
    dateProvider.now.setHours(8, 0, 0, 0)
    const scheduledSession = buildBlockSession({
      startedAt: '14:00',
      endedAt: '16:00',
      blocklistIds: ['blocklist-3'],
    })
    const state = stateBuilder().withBlockSessions([scheduledSession]).build()

    const retrievedBlocklistIds = selectLockedBlocklistIds(state, dateProvider)

    expect(retrievedBlocklistIds).toContain('blocklist-3')
  })

  test('returns blocklist ids from both active and scheduled sessions', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const activeSession = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['blocklist-1'],
    })
    const scheduledSession = buildBlockSession({
      startedAt: '14:00',
      endedAt: '16:00',
      blocklistIds: ['blocklist-2'],
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession, scheduledSession])
      .build()

    const retrievedBlocklistIds = selectLockedBlocklistIds(state, dateProvider)

    expect(retrievedBlocklistIds).toStrictEqual(['blocklist-1', 'blocklist-2'])
  })

  test('returns unique blocklist ids when same blocklist is used in multiple sessions', () => {
    dateProvider.now.setHours(10, 0, 0, 0)
    const activeSession = buildBlockSession({
      startedAt: '09:00',
      endedAt: '11:00',
      blocklistIds: ['blocklist-shared', 'blocklist-1'],
    })
    const scheduledSession = buildBlockSession({
      startedAt: '14:00',
      endedAt: '16:00',
      blocklistIds: ['blocklist-shared', 'blocklist-2'],
    })
    const state = stateBuilder()
      .withBlockSessions([activeSession, scheduledSession])
      .build()

    const retrievedBlocklistIds = selectLockedBlocklistIds(state, dateProvider)

    expect(retrievedBlocklistIds).toHaveLength(3)
    expect(retrievedBlocklistIds).toContain('blocklist-shared')
    expect(retrievedBlocklistIds).toContain('blocklist-1')
    expect(retrievedBlocklistIds).toContain('blocklist-2')
  })
})
