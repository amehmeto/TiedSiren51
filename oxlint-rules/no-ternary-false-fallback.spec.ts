/**
 * @fileoverview Tests for no-ternary-false-fallback rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './no-ternary-false-fallback.js'

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-ternary-false-fallback', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-ternary-false-fallback', rule, {
      valid: [
        {
          code: `const result = condition ? valueA : valueB`,
        },
        {
          code: `const result = condition ? true : null`,
        },
        {
          code: `const result = condition && isDisabled`,
        },
        {
          code: `const result = condition ? value : 0`,
        },
        {
          code: `const result = condition ? value : ''`,
        },
      ],

      invalid: [
        {
          code: `const isDisabled = viewModel.type === 'SUCCESS' ? viewModel.isDisabled : false`,
          errors: [{ messageId: 'noTernaryFalseFallback' }],
        },
        {
          code: `const result = x ? fn(x) : false`,
          errors: [{ messageId: 'noTernaryFalseFallback' }],
        },
        {
          code: `const isActive = condition ? someCheck() : false`,
          errors: [{ messageId: 'noTernaryFalseFallback' }],
        },
      ],
    })
  })
})
