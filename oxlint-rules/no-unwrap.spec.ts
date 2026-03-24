/**
 * @fileoverview Tests for no-unwrap rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import { createRequire } from 'node:module'

import rule from './no-unwrap.js'

const require = createRequire(import.meta.url)

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
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
