import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsStrictModeLoading } from './selectIsStrictModeLoading'

describe('selectIsStrictModeLoading', () => {
  test('should return loading state from strict mode slice', () => {
    const store = createTestStore(
      {},
      stateBuilder().withStrictModeEndedAt(null).build(),
    )

    const isLoading = selectIsStrictModeLoading(store.getState())

    expect(isLoading).toBe(true)
  })
})
