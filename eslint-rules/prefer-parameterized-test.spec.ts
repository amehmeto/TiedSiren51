/**
 * @fileoverview Tests for prefer-parameterized-test rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-parameterized-test.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-parameterized-test', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-parameterized-test', rule, {
      valid: [
        // Only 2 similar tests — below threshold
        {
          code: `
            describe('getProvider', () => {
              test('should return Gmail', () => {
                const p = getProvider('user@gmail.com')
                expect(p).toBe('Gmail')
              })
              test('should return Outlook', () => {
                const p = getProvider('user@outlook.com')
                expect(p).toBe('Outlook')
              })
            })
          `,
          filename: '/project/core/auth/email.spec.ts',
        },
        // Tests with different structures — not parameterizable
        {
          code: `
            describe('utils', () => {
              test('should extract domain', () => {
                const d = extractDomain('user@gmail.com')
                expect(d).toBe('gmail.com')
              })
              test('should return null for unknown', () => {
                const p = getProvider('user@company.com')
                expect(p).toBeNull()
              })
              test('should handle empty', () => {
                const d = extractDomain('')
                expect(d).toBe('')
              })
            })
          `,
          filename: '/project/core/auth/email.spec.ts',
        },
        // Not a test file — rule should not apply
        {
          code: `
            describe('getProvider', () => {
              test('a', () => { const p = fn('a'); expect(p).toBe('A') })
              test('b', () => { const p = fn('b'); expect(p).toBe('B') })
              test('c', () => { const p = fn('c'); expect(p).toBe('C') })
            })
          `,
          filename: '/project/core/auth/email.ts',
        },
      ],

      invalid: [
        // 3+ structurally identical tests — should suggest parameterization
        {
          code: `
            describe('getProvider', () => {
              test('should return Gmail', () => {
                const p = getProvider('user@gmail.com')
                expect(p).toBe('Gmail')
              })
              test('should return Outlook', () => {
                const p = getProvider('user@outlook.com')
                expect(p).toBe('Outlook')
              })
              test('should return Yahoo', () => {
                const p = getProvider('user@yahoo.com')
                expect(p).toBe('Yahoo')
              })
            })
          `,
          filename: '/project/core/auth/email.spec.ts',
          errors: [{ messageId: 'preferParameterized' }],
        },
      ],
    })
  })
})
