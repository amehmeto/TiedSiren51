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
        // Return without argument - OK
        {
          code: `
        function Component() {
          if (loading) {
            return
          }
          return <div>Done</div>
        }
      `,
        },
        // Element with no children and few props - OK
        {
          code: `
        function Component() {
          if (loading) {
            return <Spinner size="small" />
          }
          return <div>Done</div>
        }
      `,
        },
        // Map without callback - OK
        {
          code: `
        function Component() {
          return items.map()
        }
      `,
        },
        // Map with non-function callback - OK
        {
          code: `
        function Component() {
          return items.map(ItemComponent)
        }
      `,
        },
        // Map callback returning non-JSX - OK
        {
          code: `
        function Component() {
          return items.map(item => null)
        }
      `,
        },
        // Map callback with block but no return - OK
        {
          code: `
        function Component() {
          return items.map(item => {
            const x = item.name
          })
        }
      `,
        },
        // Not a map call - OK
        {
          code: `
        function Component() {
          return items.filter(item => <div>{item}</div>)
        }
      `,
        },
        // Not a member expression callee - OK
        {
          code: `
        function Component() {
          return map(items, item => <div>{item}</div>)
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
        // Complex JSX in map with function expression callback
        {
          code: `
        function Component() {
          return items.map(function(item) {
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
        // JSXMemberExpression - Namespace.Component
        {
          code: `
        function Component() {
          if (loading) {
            return (
              <NS.Container>
                <span>Loading</span>
              </NS.Container>
            )
          }
          return <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Fragment in conditional return
        {
          code: `
        function Component() {
          if (loading) {
            return (
              <>
                <span>Loading</span>
              </>
            )
          }
          return <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Named Fragment in conditional
        {
          code: `
        function Component() {
          if (loading) {
            return (
              <Fragment>
                <span>Loading</span>
              </Fragment>
            )
          }
          return <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Function declaration with renderX pattern
        {
          code: `
        function renderLoading() {
          if (loading) {
            return (
              <div>
                <span>Loading...</span>
              </div>
            )
          }
          return null
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Ternary inside arrow function
        {
          code: `
        const Component = () => loading ? (
          <div>
            <span>Loading</span>
          </div>
        ) : <div>Done</div>
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Ternary inside function expression
        {
          code: `
        const Component = function() {
          return loading ? (
            <div>
              <span>Loading</span>
            </div>
          ) : <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
        // Excessive props (more than 10)
        {
          code: `
        function Component() {
          if (loading) {
            return <Input a={1} b={2} c={3} d={4} e={5} f={6} g={7} h={8} i={9} j={10} k={11} />
          }
          return <div>Done</div>
        }
      `,
          errors: [{ messageId: 'extractComponent' }],
        },
      ],
    })
  })
})
