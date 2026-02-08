/**
 * @fileoverview Tests for no-complex-jsx-in-conditionals rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-complex-jsx-in-conditionals.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-complex-jsx-in-conditionals', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-complex-jsx-in-conditionals', rule, {
      valid: [
        // Simple JSX in conditional - OK
        {
          code: `
        function Component() {
          if (loading) {
            return <div>Loading</div>
          }
          return <div>Done</div>
        }
      `,
        },
        // Simple ternary - OK
        {
          code: `
        function Component() {
          return loading ? <span>Loading</span> : <span>Done</span>
        }
      `,
        },
        // Simple map callback - OK
        {
          code: `
        function Component() {
          return items.map(item => <li key={item.id}>{item.name}</li>)
        }
      `,
        },
        // No conditional at all - OK
        {
          code: `
        function Component() {
          return (
            <div>
              <span>Hello</span>
            </div>
          )
        }
      `,
        },
      ],

      invalid: [
        // Complex JSX in if-return (nested children)
        {
          code: `
        function Component() {
          if (loading) {
            return (
              <div>
                <span>Loading</span>
              </div>
            )
          }
          return <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Complex JSX in ternary consequent
        {
          code: `
        function Component() {
          return loading ? (
            <div>
              <span>Loading</span>
            </div>
          ) : <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Complex JSX in ternary alternate
        {
          code: `
        function Component() {
          return loading ? <div>Loading</div> : (
            <div>
              <span>Done</span>
            </div>
          )
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Complex JSX in map callback
        {
          code: `
        function Component() {
          return items.map(item => (
            <div>
              <span>{item.name}</span>
            </div>
          ))
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Complex JSX in map callback with block body
        {
          code: `
        function Component() {
          return items.map(item => {
            return (
              <div>
                <span>{item.name}</span>
              </div>
            )
          })
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
      ],
    })
  })
})
