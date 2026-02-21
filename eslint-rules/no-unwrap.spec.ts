/**
 * @fileoverview Tests for no-unwrap rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-unwrap.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-unwrap', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-unwrap', rule, {
      valid: [
        // Dispatch without unwrap - OK
        {
          code: `dispatch(changePassword({ newPassword }))`,
        },
        // Regular method call - OK
        {
          code: `promise.then(() => {})`,
        },
        // Other member access - OK
        {
          code: `obj.unwrapValue()`,
        },
      ],

      invalid: [
        // .unwrap() on dispatch - NOT OK
        {
          code: `dispatch(changePassword({ newPassword })).unwrap()`,
          errors: [{ messageId: 'noUnwrap' }],
        },
        // Chained .unwrap() - NOT OK
        {
          code: `dispatch(thunk()).unwrap().then(() => {})`,
          errors: [{ messageId: 'noUnwrap' }],
        },
      ],
    })
  })
})
