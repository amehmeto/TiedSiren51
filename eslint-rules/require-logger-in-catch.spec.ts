/**
 * @fileoverview Tests for require-logger-in-catch rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./require-logger-in-catch.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('require-logger-in-catch', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('require-logger-in-catch', rule, {
      valid: [
        // Logger.error in catch - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            this.logger.error(\`Failed: \${error}\`)
            throw error
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Logger.warn in catch - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            this.logger.warn(\`Warning: \${error}\`)
            throw error
          }
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Logger.info in catch - OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            this.logger.info(\`Info: \${error}\`)
            return null
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
          throw error
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
          throw error
        }
      `,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.test.ts',
        },
        // Fake implementation - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {
          throw error
        }
      `,
          filename: '/project/infra/auth-gateway/fake.auth.gateway.ts',
        },
        // In-memory implementation - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {
          throw error
        }
      `,
          filename: '/project/infra/siren-tier/in-memory.siren-tier.ts',
        },
        // Stub implementation - should not apply
        {
          code: `
        try {
          doSomething()
        } catch (error) {
          throw error
        }
      `,
          filename: '/project/infra/date-provider/stub.date-provider.ts',
        },
      ],

      invalid: [
        // No logger call in catch - NOT OK
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
          errors: [{ messageId: 'requireLogger' }],
        },
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
          errors: [{ messageId: 'requireLogger' }],
        },
        // console.log instead of logger - NOT OK
        {
          code: `
        async function doFetch() {
          try {
            await fetch()
          } catch (error) {
            console.log(error)
            throw error
          }
        }
      `,
          filename:
            '/project/infra/blocklist-repository/prisma.blocklist.repository.ts',
          errors: [{ messageId: 'requireLogger' }],
        },
      ],
    })
  })
})
