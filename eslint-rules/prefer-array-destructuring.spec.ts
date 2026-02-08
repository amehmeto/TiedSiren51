/**
 * @fileoverview Tests for prefer-array-destructuring rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-array-destructuring.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-array-destructuring', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-array-destructuring', rule, {
      valid: [
        // Already using destructuring - should NOT report
        {
          code: `const [first] = array`,
        },
        // Accessing non-zero index - should NOT report
        {
          code: `const second = array[1]`,
        },
        // Property access (not computed) - should NOT report
        {
          code: `const length = array.length`,
        },
        // Variable index - should NOT report
        {
          code: `const item = array[index]`,
        },
        // Direct usage without assignment - should NOT report
        {
          code: `console.log(array[0])`,
        },
        // Object destructuring - should NOT report
        {
          code: `const { first } = obj`,
        },
      ],

      invalid: [
        // Basic case - SHOULD report and fix
        {
          code: `const first = array[0]`,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { name: 'first', array: 'array' },
            },
          ],
          output: `const [first] = array`,
        },
        // With method call - SHOULD report and fix
        {
          code: `const item = getItems()[0]`,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { name: 'item', array: 'getItems()' },
            },
          ],
          output: `const [item] = getItems()`,
        },
        // With property access - SHOULD report and fix
        {
          code: `const first = obj.items[0]`,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { name: 'first', array: 'obj.items' },
            },
          ],
          output: `const [first] = obj.items`,
        },
      ],
    })
  })
})
