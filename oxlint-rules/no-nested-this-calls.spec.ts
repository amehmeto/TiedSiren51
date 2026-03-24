/**
 * @fileoverview Tests for no-nested-this-calls rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './no-nested-this-calls.js'

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020 } })

describe('no-nested-this-calls', () => {
  it('should enforce no nested this.method() calls', () => {
    ruleTester.run('no-nested-this-calls', rule, {
      valid: [
        // Separate variable
        `class A {
          m() {
            const x = this.parse("a")
            return this.format(x)
          }
        }`,
        // Not this calls
        `class A {
          m() {
            return foo(bar())
          }
        }`,
        // Single this call
        `class A {
          m() {
            return this.format("x")
          }
        }`,
      ],
      invalid: [
        {
          code: `class A {
            m() {
              return this.format(this.parse("a"))
            }
          }`,
          errors: [{ messageId: 'nestedThisCall' }],
        },
      ],
    })
  })
})
