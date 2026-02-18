import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { setPassword } from '@/core/auth/reducer'
import {
  sanitizeDevToolsAction,
  sanitizeDevToolsState,
  sanitizeState,
} from './sensitive-fields-sanitizer'

describe('Sensitive fields sanitizer', () => {
  describe('sanitizeState', () => {
    it('redacts auth.password when present', () => {
      const store = createTestStore()
      store.dispatch(setPassword('my-secret'))

      const sanitized = sanitizeState(store.getState())

      const { password } = sanitized.auth
      expect(password).toBe('[REDACTED]')
    })

    it('returns state unchanged when password is empty', () => {
      const store = createTestStore()
      const state = store.getState()

      const sanitized = sanitizeState(state)

      expect(sanitized).toBe(state)
    })
  })

  describe('sanitizeDevToolsState', () => {
    it('redacts auth.password from a generic state object', () => {
      const store = createTestStore()
      store.dispatch(setPassword('my-secret'))

      const sanitized = sanitizeDevToolsState(store.getState())

      const { password } = sanitized.auth
      expect(password).toBe('[REDACTED]')
    })

    it('returns state unchanged when password is empty', () => {
      const store = createTestStore()
      const state = store.getState()

      const sanitized = sanitizeDevToolsState(state)

      expect(sanitized).toBe(state)
    })

    it('returns non-RootState values unchanged', () => {
      const state = { unrelated: true }

      const sanitized = sanitizeDevToolsState(state)

      expect(sanitized).toBe(state)
    })
  })

  describe('sanitizeDevToolsAction', () => {
    it('redacts setPassword action payload', () => {
      const action = setPassword('my-secret')

      const sanitized = sanitizeDevToolsAction(action)

      expect(sanitized.type).toBe('auth/setPassword')
      expect(sanitized.payload).toBe('[REDACTED]')
    })

    it('returns other actions unchanged', () => {
      const action = { type: 'auth/setEmail', payload: 'test@email.com' }

      const sanitized = sanitizeDevToolsAction(action)

      expect(sanitized).toBe(action)
    })
  })

  describe('logActionMiddleware integration', () => {
    it('stores sanitized setPassword actions', () => {
      const store = createTestStore()

      store.dispatch(setPassword('my-secret'))

      const actions = store.getActions()
      const setPasswordAction = actions.find(
        (a) => a.type === 'auth/setPassword',
      )
      expect(setPasswordAction).toBeDefined()
      expect(setPasswordAction).toHaveProperty('payload', '[REDACTED]')
    })

    it('password still works for auth thunks after sanitization', () => {
      const store = createTestStore()

      store.dispatch(setPassword('my-secret'))

      const { password } = store.getState().auth
      expect(password).toBe('my-secret')
    })
  })
})
