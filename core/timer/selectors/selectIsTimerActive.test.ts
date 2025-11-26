import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsTimerActive } from './selectIsTimerActive'

describe('selectIsTimerActive', () => {
  test('should return false when there is no timer', () => {
    const store = createTestStore({}, stateBuilder().withTimer(null).build())

    const isActive = selectIsTimerActive(store.getState())

    expect(isActive).toBe(false)
  })

  test('should return false when timer is not active', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withTimer(buildTimer({ isActive: false }))
        .build(),
    )

    const isActive = selectIsTimerActive(store.getState())

    expect(isActive).toBe(false)
  })

  test('should return true when timer is active', () => {
    const store = createTestStore(
      {},
      stateBuilder().withTimer(buildTimer({})).build(),
    )

    const isActive = selectIsTimerActive(store.getState())

    expect(isActive).toBe(true)
  })
})
