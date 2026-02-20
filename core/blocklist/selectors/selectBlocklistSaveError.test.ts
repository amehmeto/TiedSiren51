import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectBlocklistSaveError } from './selectBlocklistSaveError'

describe('selectBlocklistSaveError', () => {
  test('should return null when there is no save error', () => {
    const state = stateBuilder().build()

    const saveError = selectBlocklistSaveError(state)

    expect(saveError).toBeNull()
  })

  test('should return save error when present', () => {
    const state = stateBuilder().build()
    const stateWithError = {
      ...state,
      blocklist: {
        ...state.blocklist,
        saveError: 'Failed to create blocklist',
      },
    }

    const saveError = selectBlocklistSaveError(stateWithError)

    expect(saveError).toBe('Failed to create blocklist')
  })
})
