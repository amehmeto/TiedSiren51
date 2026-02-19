import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { showToast } from '@/core/toast/toast.slice'
import { selectToast } from './selectToast'

describe('selectToast', () => {
  test('should return toast state', () => {
    const store = createTestStore()
    store.dispatch(showToast('Test message'))
    const expectedToast = { message: 'Test message' }

    const toast = selectToast(store.getState())

    expect(toast).toStrictEqual(expectedToast)
  })
})
