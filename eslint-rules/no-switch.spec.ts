/**
 * @fileoverview Tests for no-switch rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-switch.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-switch', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-switch', rule, {
      valid: [
        // if/else chain - OK
        {
          code: `
        if (x === 1) {
          doA()
        } else {
          doB()
        }
      `,
        },
        // Object map - OK
        {
          code: `
        const actions = { 1: doA, 2: doB }
        actions[x]()
      `,
        },
        // Ternary - OK
        {
          code: `const result = x === 1 ? 'a' : 'b'`,
        },
        // Simple variable declaration - OK
        {
          code: `const a = 1`,
        },
      ],

      invalid: [
        // Basic switch - NOT OK
        {
          code: `
        switch (x) {
          case 1:
            break
        }
      `,
          errors: [{ messageId: 'noSwitch' }],
        },
        // Switch with multiple cases - NOT OK
        {
          code: `
        function reducer(state, action) {
          switch (action.type) {
            case 'ADD':
              return state + 1
            case 'REMOVE':
              return state - 1
            default:
              return state
          }
        }
      `,
          errors: [{ messageId: 'noSwitch' }],
        },
        // Switch with default only - NOT OK
        {
          code: `
        switch (x) {
          default:
            doSomething()
        }
      `,
          errors: [{ messageId: 'noSwitch' }],
        },
      ],
    })
  })
})
