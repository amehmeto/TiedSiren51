import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectAuthSlice } from './selectAuthSlice'

describe('selectAuthSlice', () => {
  test('should return the auth slice from state', () => {
    const store = createTestStore({}, stateBuilder().build())

    const authSlice = selectAuthSlice(store.getState())

    expect(authSlice).toBe(store.getState().auth)
  })
})
