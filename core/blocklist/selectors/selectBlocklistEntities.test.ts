import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectBlocklistEntities } from './selectBlocklistEntities'

describe('selectBlocklistEntities', () => {
  test('should return empty object when there are no blocklists', () => {
    const store = createTestStore({}, stateBuilder().build())

    const entities = selectBlocklistEntities(store.getState())

    expect(entities).toStrictEqual({})
  })

  test('should return blocklist entities keyed by id', () => {
    const blocklist1 = buildBlocklist({
      id: 'bl-1',
      name: 'Social Media',
    })
    const blocklist2 = buildBlocklist({
      id: 'bl-2',
      name: 'Games',
    })
    const expectedEntities = {
      'bl-1': blocklist1,
      'bl-2': blocklist2,
    }

    const store = createTestStore(
      {},
      stateBuilder().withBlocklists([blocklist1, blocklist2]).build(),
    )

    const entities = selectBlocklistEntities(store.getState())

    expect(entities).toStrictEqual(expectedEntities)
  })
})
