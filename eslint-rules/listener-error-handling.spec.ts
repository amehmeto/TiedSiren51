/**
 * @fileoverview Tests for listener-error-handling rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./listener-error-handling.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('listener-error-handling', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('listener-error-handling', rule, {
      valid: [
        // Listener with try-catch - OK
        {
          code: `
        export const onUserLoggedInListener = () => {
          try {
            doSomething()
          } catch (error) {
            logger.error(error)
          }
        }
      `,
          filename:
            '/project/core/auth/listeners/on-user-logged-in.listener.ts',
        },
        // Listener with safe* function call - OK
        {
          code: `
        export const onSessionStartedListener = () => {
          safeExecute(() => doSomething())
        }
      `,
          filename:
            '/project/core/session/listeners/on-session-started.listener.ts',
        },
        // Listener with this.safeMethod() - OK
        {
          code: `
        export const onBlocklistUpdatedListener = () => {
          this.safeDispatch(action)
        }
      `,
          filename:
            '/project/core/blocklist/listeners/on-blocklist-updated.listener.ts',
        },
        // Not a listener file - should not apply
        {
          code: `
        export const doSomething = () => {
          riskyOperation()
        }
      `,
          filename: '/project/core/auth/usecases/login.usecase.ts',
        },
        // Test file - should not apply
        {
          code: `
        export const onTestListener = () => {
          riskyOperation()
        }
      `,
          filename: '/project/core/auth/listeners/on-test.listener.test.ts',
        },
        // Spec file - should not apply
        {
          code: `
        export const onTestListener = () => {
          riskyOperation()
        }
      `,
          filename: '/project/core/auth/listeners/on-test.listener.spec.ts',
        },
        // Fixture file - should not apply
        {
          code: `
        export const listenerFixture = {}
      `,
          filename: '/project/core/auth/listeners/listener.fixture.ts',
        },
      ],

      invalid: [
        // Listener without error handling - NOT OK
        {
          code: `
        export const onUserLoggedInListener = () => {
          doSomething()
        }
      `,
          filename:
            '/project/core/auth/listeners/on-user-logged-in.listener.ts',
          errors: [{ messageId: 'missingErrorHandling' }],
        },
        // Listener with just logging (no try-catch or safe*) - NOT OK
        {
          code: `
        export const onSessionStartedListener = () => {
          logger.info('Session started')
          dispatch(action)
        }
      `,
          filename:
            '/project/core/session/listeners/on-session-started.listener.ts',
          errors: [{ messageId: 'missingErrorHandling' }],
        },
        // Empty listener - NOT OK
        {
          code: `
        export const onEmptyListener = () => {}
      `,
          filename: '/project/core/auth/listeners/on-empty.listener.ts',
          errors: [{ messageId: 'missingErrorHandling' }],
        },
      ],
    })
  })
})
