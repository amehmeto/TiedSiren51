/**
 * @fileoverview Tests for infra-must-rethrow rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./infra-must-rethrow.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('infra-must-rethrow', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('infra-must-rethrow', rule, {
      valid: [
        // Rethrow after logging - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            this.logger.error(error)
            throw error
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Return in catch (fallback value) - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            this.logger.error(error)
            return null
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Early throw - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            throw new CustomError(error.message)
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Not in infra - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {
          console.log(error)
        }
      `,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Test file - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {
          console.log(error)
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.test.ts',
        },
        // Spec file - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {
          console.log(error)
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.spec.ts',
        },
      ],

      invalid: [
        // Empty catch block - NOT OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [{ messageId: 'mustRethrow' }],
        },
        // Only logging, no rethrow - NOT OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            this.logger.error(error)
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [{ messageId: 'mustRethrow' }],
        },
        // Swallowing error silently - NOT OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            console.log('Something went wrong')
          }
        }
      `,
          filename:
            '/project/infra/blocklist-repository/prisma.blocklist.repository.ts',
          errors: [{ messageId: 'mustRethrow' }],
        },
      ],
    })
  })
})
