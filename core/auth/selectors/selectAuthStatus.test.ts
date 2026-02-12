import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectAuthStatus } from './selectAuthStatus'

describe('selectAuthStatus', () => {
  test('should return default auth status', () => {
    const store = createTestStore({}, stateBuilder().build())

    const { isLoading, error } = selectAuthStatus(store.getState())

    expect(isLoading).toBe(false)
    expect(error).toBeNull()
  })
})
