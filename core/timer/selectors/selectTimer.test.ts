import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectTimer } from './selectTimer'

describe('selectTimer', () => {
  test('should return null when there is no timer', () => {
    const store = createTestStore({}, stateBuilder().withTimer(null).build())

    const timer = selectTimer(store.getState())

    expect(timer).toBeNull()
  })

  test('should return timer when timer exists', () => {
    const timer = buildTimer()

    const store = createTestStore({}, stateBuilder().withTimer(timer).build())

    const selectedTimer = selectTimer(store.getState())

    expect(selectedTimer).toStrictEqual(timer)
  })
})
