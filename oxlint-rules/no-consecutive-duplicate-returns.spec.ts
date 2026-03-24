/**
 * @fileoverview Tests for no-consecutive-duplicate-returns rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './no-consecutive-duplicate-returns.js'

const ruleTester = new RuleTester({
  languageOptions: {
    sourceType: 'module',
  },
})

describe('no-consecutive-duplicate-returns', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-consecutive-duplicate-returns', rule, {
      valid: [
        // Different return values
        {
          code: `function f() { if (!a) return EMPTY; if (!b) return OTHER; }`,
        },
        // Non-consecutive (separated by another statement)
        {
          code: `function f() { if (!a) return EMPTY; doSomething(); if (!b) return EMPTY; }`,
        },
        // Single if-return
        {
          code: `function f() { if (!a) return EMPTY; return result; }`,
        },
        // If with else clause
        {
          code: `function f() { if (!a) { return EMPTY; } else { doSomething(); } if (!b) return EMPTY; }`,
        },
        // Not a return in consequent
        {
          code: `function f() { if (!a) doSomething(); if (!b) return EMPTY; }`,
        },
        // Consecutive ifs but not returning
        {
          code: `function f() { if (!a) doA(); if (!b) doB(); }`,
        },
      ],

      invalid: [
        // Basic case
        {
          code: `function f() { if (!a) return EMPTY; if (!b) return EMPTY; }`,
          errors: [{ messageId: 'mergeReturns' }],
        },
        // Block body
        {
          code: `function f() { if (!a) { return EMPTY; } if (!b) { return EMPTY; } }`,
          errors: [{ messageId: 'mergeReturns' }],
        },
        // Returning null
        {
          code: `function f() { if (!a) return null; if (!b) return null; }`,
          errors: [{ messageId: 'mergeReturns' }],
        },
        // Returning undefined
        {
          code: `function f() { if (!a) return; if (!b) return; }`,
          errors: [{ messageId: 'mergeReturns' }],
        },
        // Three consecutive (reports on 2nd and 3rd)
        {
          code: `function f() { if (!a) return EMPTY; if (!b) return EMPTY; if (!c) return EMPTY; }`,
          errors: [
            { messageId: 'mergeReturns' },
            { messageId: 'mergeReturns' },
          ],
        },
        // Real-world case
        {
          code: `function select(state, dateProvider, blocklistId) { if (!blocklistId) return EMPTY_LOCKED_SIRENS; if (!isActive(state, dateProvider)) return EMPTY_LOCKED_SIRENS; }`,
          errors: [{ messageId: 'mergeReturns' }],
        },
      ],
    })
  })
})
