/**
 * @fileoverview Tests for no-new-in-test-body rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-new-in-test-body.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-new-in-test-body', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-new-in-test-body', rule, {
      valid: [
        // Instantiation in beforeEach - OK
        {
          code: `
        describe('test', () => {
          let service
          beforeEach(() => {
            service = new AuthService()
          })
          it('should work', () => {
            expect(service.isLoggedIn()).toBe(true)
          })
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Allowed built-ins in test body - OK
        {
          code: `
        it('should work', () => {
          const date = new Date()
          const map = new Map()
          const set = new Set()
          const url = new URL('https://example.com')
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Error classes are allowed - OK
        {
          code: `
        it('should throw', () => {
          expect(() => {}).toThrow(new Error('message'))
          expect(() => {}).toThrow(new CustomError('message'))
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Not a test file - should not apply
        {
          code: `
        const service = new AuthService()
      `,
          filename: '/project/core/auth/auth.ts',
        },
        // Outside it/test blocks - should not apply
        {
          code: `
        describe('test', () => {
          const service = new AuthService()
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
        },
      ],

      invalid: [
        // Instantiation inside it block - NOT OK
        {
          code: `
        it('should work', () => {
          const service = new AuthService()
          expect(service.isLoggedIn()).toBe(true)
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'noNewInTestBody',
              data: { className: 'AuthService' },
            },
          ],
        },
        // Instantiation inside test block - NOT OK
        {
          code: `
        test('should work', () => {
          const repo = new BlocklistRepository()
          expect(repo.findAll()).toEqual([])
        })
      `,
          filename: '/project/core/blocklist/blocklist.test.ts',
          errors: [
            {
              messageId: 'noNewInTestBody',
              data: { className: 'BlocklistRepository' },
            },
          ],
        },
        // Multiple instantiations - NOT OK
        {
          code: `
        it('should work', () => {
          const service = new AuthService()
          const repo = new AuthRepository()
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'noNewInTestBody',
              data: { className: 'AuthService' },
            },
            {
              messageId: 'noNewInTestBody',
              data: { className: 'AuthRepository' },
            },
          ],
        },
        // Spec file - NOT OK
        {
          code: `
        it('should work', () => {
          const service = new AuthService()
        })
      `,
          filename: '/project/core/auth/auth.spec.ts',
          errors: [
            {
              messageId: 'noNewInTestBody',
              data: { className: 'AuthService' },
            },
          ],
        },
        // Namespaced class (MemberExpression callee) - NOT OK
        {
          code: `
        it('should work', () => {
          const service = new Auth.Service()
        })
      `,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'noNewInTestBody',
              data: { className: 'Service' },
            },
          ],
        },
      ],
    })
  })
})
