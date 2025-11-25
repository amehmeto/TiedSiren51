import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import {
  buildTimer,
  timerWithRemainingTime,
} from '@/core/_tests_/data-builders/timer.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsTimerActive } from './selectIsTimerActive'

describe('selectIsTimerActive', () => {
  test('should return false when there is no timer', () => {
    const store = createTestStore({}, stateBuilder().withTimer(null).build())

    const isActive = selectIsTimerActive(store.getState())

    expect(isActive).toBe(false)
  })

  test('should return false when timer is not active', () => {
    const timer = timerWithRemainingTime.inactive()

    const store = createTestStore({}, stateBuilder().withTimer(timer).build())

    const isActive = selectIsTimerActive(store.getState())

    expect(isActive).toBe(false)
  })

  test('should return true when timer is active', () => {
    const timer = buildTimer()

    const store = createTestStore({}, stateBuilder().withTimer(timer).build())

    const isActive = selectIsTimerActive(store.getState())

    expect(isActive).toBe(true)
  })
})
