import { describe, expect, test } from 'vitest'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectBlocklistById } from './selectBlocklistById'

describe('selectBlocklistById', () => {
  test('should return blocklist when it exists', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      name: 'Test Blocklist',
    })
    const state = stateBuilder().withBlocklists([blocklist]).build()

    const selectedBlocklist = selectBlocklistById(state, 'blocklist-1')

    expect(selectedBlocklist).toBeDefined()
    expect(selectedBlocklist?.id).toBe('blocklist-1')
    expect(selectedBlocklist?.name).toBe('Test Blocklist')
  })

  test('should return undefined when blocklistId is undefined', () => {
    const state = stateBuilder().build()

    const selectedBlocklist = selectBlocklistById(state, undefined)

    expect(selectedBlocklist).toBeUndefined()
  })

  test('should return undefined when blocklist does not exist', () => {
    const state = stateBuilder().build()

    const selectedBlocklist = selectBlocklistById(state, 'non-existent')

    expect(selectedBlocklist).toBeUndefined()
  })
})
