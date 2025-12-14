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

    const result = selectBlocklistById('blocklist-1', state)

    expect(result).toBeDefined()
    expect(result.id).toBe('blocklist-1')
    expect(result.name).toBe('Test Blocklist')
  })

  test('should return undefined when blocklist does not exist', () => {
    const state = stateBuilder().build()

    const result = selectBlocklistById('non-existent', state)

    expect(result).toBeUndefined()
  })
})
