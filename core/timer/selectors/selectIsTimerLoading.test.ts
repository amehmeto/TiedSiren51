import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsTimerLoading } from './selectIsTimerLoading'

describe('selectIsTimerLoading', () => {
  test('should return loading state from timer slice', () => {
    const store = createTestStore({}, stateBuilder().withTimer(null).build())

    const isLoading = selectIsTimerLoading(store.getState())

    expect(isLoading).toBe(true)
  })
})
