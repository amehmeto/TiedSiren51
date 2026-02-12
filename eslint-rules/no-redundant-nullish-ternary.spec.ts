/**
 * @fileoverview Tests for no-redundant-nullish-ternary rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-redundant-nullish-ternary.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-redundant-nullish-ternary', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-redundant-nullish-ternary', rule, {
      valid: [
        // Normal ternary where alternate is not a default falsy value
        {
          code: `const result = x ? doA() : doB()`,
        },
        // Condition variable not passed to function
        {
          code: `const result = x ? fn(other) : false`,
        },
        // Non-default alternate value (variable, not literal)
        {
          code: `const result = x ? fn(x) : someOtherValue`,
        },
        // No ternary at all
        {
          code: `const result = fn(x)`,
        },
        // Condition is member expression, not simple identifier
        {
          code: `const result = x.y ? fn(x.y) : false`,
        },
        // Condition is call expression
        {
          code: `const result = getX() ? fn(getX()) : false`,
        },
        // Consequent is not a call expression
        {
          code: `const result = x ? x.value : false`,
        },
        // Alternate is a non-zero number
        {
          code: `const result = x ? fn(x) : 42`,
        },
        // Alternate is a non-empty string
        {
          code: `const result = x ? fn(x) : 'fallback'`,
        },
        // Alternate is a non-empty array
        {
          code: `const result = x ? fn(x) : [1, 2]`,
        },
      ],

      invalid: [
        // Basic case: false alternate
        {
          code: `const isLocked = x ? fn(x) : false`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // null alternate
        {
          code: `const result = x ? fn(x, a, b) : null`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // undefined alternate
        {
          code: `const result = x ? fn(x) : undefined`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // Zero alternate
        {
          code: `const result = x ? fn(x) : 0`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // Empty string alternate
        {
          code: `const result = x ? fn(x) : ""`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // Empty array alternate
        {
          code: `const result = x ? fn(x) : []`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // Real-world case from PR
        {
          code: `const isLocked = lockedSirens ? isSirenLocked(lockedSirens, type, id) : false`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // Member expression callee
        {
          code: `const result = x ? obj.method(x) : false`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
        // Variable among multiple arguments
        {
          code: `const result = data ? process(a, data, b) : null`,
          errors: [{ messageId: 'noRedundantNullishTernary' }],
        },
      ],
    })
  })
})
