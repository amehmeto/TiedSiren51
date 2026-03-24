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
        // Nested but not this — outer is this, inner is not
        `class A {
          m() {
            return this.format(other.parse("a"))
          }
        }`,
        // Nested but not this — outer is not this
        `class A {
          m() {
            return other.format(this.parse("a"))
          }
        }`,
        // this call with no arguments
        `class A {
          m() {
            return this.getAll()
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
        // Computed property names (covers '?' fallback branches)
        {
          code: `class A {
            m() {
              const key = "format"
              return this[key](this.parse("a"))
            }
          }`,
          errors: [{ messageId: 'nestedThisCall' }],
        },
        {
          code: `class A {
            m() {
              const key = "parse"
              return this.format(this[key]("a"))
            }
          }`,
          errors: [{ messageId: 'nestedThisCall' }],
        },
      ],
    })
  })
})
