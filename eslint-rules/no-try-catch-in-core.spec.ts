/**
 * @fileoverview Tests for no-try-catch-in-core rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-try-catch-in-core.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-try-catch-in-core', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-try-catch-in-core', rule, {
      valid: [
        // No try-catch in core - OK
        {
          code: `
        function doSomething() {
          return calculate()
        }
      `,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Try-catch in infra - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            throw error
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Try-catch in ui - OK
        {
          code: `
        try {
          parseInput()
        } catch (error) {
          showError()
        }
      `,
          filename: '/project/ui/screens/Home/HomeScreen.tsx',
        },
        // Try-catch in listeners (boundary) - OK
        {
          code: `
        async function handleEvent() {
          try {
            await dispatch()
          } catch (error) {
            logger.error(error)
          }
        }
      `,
          filename:
            '/project/core/auth/listeners/on-user-logged-in.listener.ts',
        },
        // Test file - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {}
      `,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Spec file - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {}
      `,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Fixture file - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {}
      `,
          filename: '/project/core/auth/auth.fixture.ts',
        },
      ],

      invalid: [
        // Try-catch in core slice - NOT OK
        {
          code: `
        function doSomething() {
          try {
            calculate()
          } catch (error) {
            return null
          }
        }
      `,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [{ messageId: 'noTryCatchInCore' }],
        },
        // Try-catch in core usecase - NOT OK
        {
          code: `
        export const login = () => {
          try {
            authenticate()
          } catch (error) {
            throw error
          }
        }
      `,
          filename: '/project/core/auth/usecases/login.usecase.ts',
          errors: [{ messageId: 'noTryCatchInCore' }],
        },
        // Try-catch in core selector - NOT OK
        {
          code: `
        export const selectUser = (state) => {
          try {
            return state.user
          } catch (error) {
            return null
          }
        }
      `,
          filename: '/project/core/auth/selectors/selectUser.ts',
          errors: [{ messageId: 'noTryCatchInCore' }],
        },
      ],
    })
  })
})
