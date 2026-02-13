/**
 * @fileoverview Tests for prefer-ternary-return rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-ternary-return.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('prefer-ternary-return', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-ternary-return', rule, {
      valid: [
        // if with else clause - not matched
        {
          code: `
            function foo(x) {
              if (x) return 1
              else return 2
            }
          `,
        },
        // if without return in consequent
        {
          code: `
            function foo(x) {
              if (x) console.log('yes')
              return 2
            }
          `,
        },
        // if not followed by return
        {
          code: `
            function foo(x) {
              if (x) return 1
              console.log('after')
            }
          `,
        },
        // if is last statement in block
        {
          code: `
            function foo(x) {
              if (x) return 1
            }
          `,
        },
        // Chained if-returns - skip to avoid nested ternaries
        {
          code: `
            function foo(x, y) {
              if (x) return 1
              if (y) return 2
              return 3
            }
          `,
        },
        // if with block statement containing multiple statements
        {
          code: `
            function foo(x) {
              if (x) {
                console.log('yes')
                return 1
              }
              return 2
            }
          `,
        },
        // JSX in returns with skipJsx enabled
        {
          code: `
            function Comp(props) {
              if (props.loading) return <Loading />
              return <Content />
            }
          `,
          options: [{ skipJsx: true }],
        },
        // JSX in alternate with skipJsx enabled
        {
          code: `
            function Comp(props) {
              if (props.error) return null
              return <Content />
            }
          `,
          options: [{ skipJsx: true }],
        },
        // Nested JSX in array with skipJsx enabled (tests array traversal path)
        {
          code: `
            function Comp(props) {
              if (props.loading) return [<A key="a" />, <B key="b" />]
              return []
            }
          `,
          options: [{ skipJsx: true }],
        },
        // JSX in function call argument with skipJsx enabled (tests object traversal path)
        {
          code: `
            function Comp(props) {
              if (props.loading) return wrap(<Loading />)
              return wrap(<Content />)
            }
          `,
          options: [{ skipJsx: true }],
        },
        // Multi-line return expression (complex)
        {
          code: `
            function foo(x) {
              if (x) return {
                a: 1,
                b: 2
              }
              return null
            }
          `,
        },
        // Not inside a block statement (arrow function body)
        {
          code: `
            const foo = (x) => x ? 1 : 2
          `,
        },
        // Multi-line alternate expression
        {
          code: `
            function foo(x) {
              if (x) return 1
              return {
                a: 1,
                b: 2
              }
            }
          `,
        },
        // JSXText in return with skipJsx enabled
        {
          code: `
            function Comp() {
              if (loading) return <>Loading...</>
              return <>Done</>
            }
          `,
          options: [{ skipJsx: true }],
        },
        // Not a valid return in consequent (block with multiple statements)
        {
          code: `
            function foo(x) {
              if (x) {
                console.log('log')
              }
              return 2
            }
          `,
        },
      ],
      invalid: [
        // Basic: simple if-return followed by return
        {
          code: `
            function foo(x) {
              if (x) return 1
              return 2
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
              data: { condition: 'x', consequent: '1', alternate: '2' },
            },
          ],
        },
        // Block statement with single return
        {
          code: `
            function foo(x) {
              if (x) {
                return 1
              }
              return 2
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
              data: { condition: 'x', consequent: '1', alternate: '2' },
            },
          ],
        },
        // Complex condition
        {
          code: `
            function foo(x, y) {
              if (x && y) return 'yes'
              return 'no'
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
              data: {
                condition: 'x && y',
                consequent: "'yes'",
                alternate: "'no'",
              },
            },
          ],
        },
        // Null check pattern
        {
          code: `
            function foo(x) {
              if (!x) return null
              return x.value
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
              data: {
                condition: '!x',
                consequent: 'null',
                alternate: 'x.value',
              },
            },
          ],
        },
        // Boolean return
        {
          code: `
            function isValid(x) {
              if (x > 10) return true
              return false
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
              data: {
                condition: 'x > 10',
                consequent: 'true',
                alternate: 'false',
              },
            },
          ],
        },
        // JSX without skipJsx option (should flag)
        {
          code: `
            function Comp(props) {
              if (props.loading) return <Loading />
              return <Content />
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
            },
          ],
        },
        // JSX with skipJsx: false (should flag)
        {
          code: `
            function Comp(props) {
              if (props.loading) return <Loading />
              return <Content />
            }
          `,
          options: [{ skipJsx: false }],
          errors: [
            {
              messageId: 'preferTernary',
            },
          ],
        },
        // Long expression gets truncated in message
        {
          code: `
            function foo(x) {
              if (x) return 'this is a very long string literal'
              return 'short'
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
              data: {
                condition: 'x',
                consequent: "'this is a very long string...",
                alternate: "'short'",
              },
            },
          ],
        },
        // First if in a potential chain should still be flagged if next is not if-return
        {
          code: `
            function foo(x, y) {
              if (x) return 1
              return y ? 2 : 3
            }
          `,
          errors: [
            {
              messageId: 'preferTernary',
            },
          ],
        },
      ],
    })
  })
})
