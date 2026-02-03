import { describe, expect, test } from 'vitest'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectBlocklistsByIds } from './selectBlocklistsByIds'

describe('selectBlocklistsByIds', () => {
  test('should return empty array when no blocklist ids provided', () => {
    const state = stateBuilder().build()

    const result = selectBlocklistsByIds(state, [])

    expect(result).toStrictEqual([])
  })

  test('should return blocklists for valid ids', () => {
    const blocklist1 = buildBlocklist({ id: 'bl-1', name: 'Social Media' })
    const blocklist2 = buildBlocklist({ id: 'bl-2', name: 'Games' })
    const state = stateBuilder()
      .withBlocklists([blocklist1, blocklist2])
      .build()
    const expectedBlocklists = [blocklist1, blocklist2]

    const result = selectBlocklistsByIds(state, ['bl-1', 'bl-2'])

    expect(result).toStrictEqual(expectedBlocklists)
  })

  test('should filter out non-existent blocklist ids', () => {
    const blocklist = buildBlocklist({ id: 'bl-1', name: 'Social Media' })
    const state = stateBuilder().withBlocklists([blocklist]).build()
    const expectedBlocklists = [blocklist]

    const result = selectBlocklistsByIds(state, ['bl-1', 'non-existent'])

    expect(result).toStrictEqual(expectedBlocklists)
  })

  test('should return empty array when all ids are non-existent', () => {
    const state = stateBuilder().build()

    const result = selectBlocklistsByIds(state, [
      'non-existent-1',
      'non-existent-2',
    ])

    expect(result).toStrictEqual([])
  })
})
