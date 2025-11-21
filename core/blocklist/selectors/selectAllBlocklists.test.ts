import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectAllBlocklists } from './selectAllBlocklists'

describe('selectAllBlocklists', () => {
  test('should return empty array when there are no blocklists', () => {
    const store = createTestStore({}, stateBuilder().build())

    const blocklists = selectAllBlocklists(store.getState())

    expect(blocklists).toEqual([])
  })

  test('should return single blocklist', () => {
    const blocklist = buildBlocklist({
      id: '1',
      name: 'Social Media',
    })

    const store = createTestStore(
      {},
      stateBuilder().withBlocklists([blocklist]).build(),
    )

    const blocklists = selectAllBlocklists(store.getState())

    expect(blocklists).toEqual([blocklist])
  })

  test('should return multiple blocklists', () => {
    const blocklist1 = buildBlocklist({
      id: '1',
      name: 'Social Media',
    })
    const blocklist2 = buildBlocklist({
      id: '2',
      name: 'Games',
    })
    const blocklist3 = buildBlocklist({
      id: '3',
      name: 'Work',
    })

    const store = createTestStore(
      {},
      stateBuilder()
        .withBlocklists([blocklist1, blocklist2, blocklist3])
        .build(),
    )

    const blocklists = selectAllBlocklists(store.getState())

    expect(blocklists).toEqual([blocklist1, blocklist2, blocklist3])
  })
})
