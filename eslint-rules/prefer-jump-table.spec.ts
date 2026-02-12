/**
 * @fileoverview Tests for prefer-jump-table rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-jump-table.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-jump-table', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-jump-table', rule, {
      valid: [
        // Only 2 ifs (below default threshold of 3)
        {
          code: `
            function f(x) {
              if (x === 'a') return 1
              if (x === 'b') return 2
            }
          `,
        },
        // 3 ifs but testing different variables
        {
          code: `
            function f(x, y, z) {
              if (x === 'a') return 1
              if (y === 'b') return 2
              if (z === 'c') return 3
            }
          `,
        },
        // 3 ifs same variable but different body patterns (return vs assign)
        {
          code: `
            function f(x) {
              let result
              if (x === 'a') return 1
              if (x === 'b') result = 2
              if (x === 'c') return 3
            }
          `,
        },
        // 3 ifs but some have else clauses (not a clean jump table)
        {
          code: `
            function f(x) {
              if (x === 'a') return 1
              else { log() }
              if (x === 'b') return 2
              if (x === 'c') return 3
            }
          `,
        },
        // 3 ifs but bodies have multiple statements
        {
          code: `
            function f(x) {
              if (x === 'a') { log(); return 1 }
              if (x === 'b') { log(); return 2 }
              if (x === 'c') { log(); return 3 }
            }
          `,
        },
        // 3 ifs but not using === operator
        {
          code: `
            function f(x) {
              if (x == 'a') return 1
              if (x == 'b') return 2
              if (x == 'c') return 3
            }
          `,
        },
        // 3 ifs assigning to different variables
        {
          code: `
            function f(x) {
              if (x === 'a') foo = 1
              if (x === 'b') bar = 2
              if (x === 'c') baz = 3
            }
          `,
        },
        // Custom threshold: 4 required, only 3 present
        {
          code: `
            function f(x) {
              if (x === 'a') return 1
              if (x === 'b') return 2
              if (x === 'c') return 3
            }
          `,
          options: [{ threshold: 4 }],
        },
        // Non-consecutive ifs (other statements in between)
        {
          code: `
            function f(x) {
              if (x === 'a') return 1
              const y = compute()
              if (x === 'b') return 2
              if (x === 'c') return 3
            }
          `,
        },
      ],

      invalid: [
        // 3 ifs testing same variable, all returning
        {
          code: `
            function f(x) {
              if (x === 'a') return 1
              if (x === 'b') return 2
              if (x === 'c') return 3
            }
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '3', variable: 'x' },
            },
          ],
        },
        // 4 ifs testing same variable, all assigning to same variable
        {
          code: `
            function f(x) {
              let result
              if (x === 'a') result = 1
              if (x === 'b') result = 2
              if (x === 'c') result = 3
              if (x === 'd') result = 4
            }
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '4', variable: 'x' },
            },
          ],
        },
        // 3 ifs all calling the same function
        {
          code: `
            function f(type) {
              if (type === 'error') console.log('err')
              if (type === 'warn') console.log('warn')
              if (type === 'info') console.log('info')
            }
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '3', variable: 'type' },
            },
          ],
        },
        // Member expression variable: node.type
        {
          code: `
            function visit(node) {
              if (node.type === 'Identifier') return handleId(node)
              if (node.type === 'Literal') return handleLit(node)
              if (node.type === 'Call') return handleCall(node)
            }
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '3', variable: 'node.type' },
            },
          ],
        },
        // Reversed comparison: 'value' === x
        {
          code: `
            function f(x) {
              if ('a' === x) return 1
              if ('b' === x) return 2
              if ('c' === x) return 3
            }
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '3', variable: 'x' },
            },
          ],
        },
        // Block body with single statement
        {
          code: `
            function f(x) {
              if (x === 'a') { return 1 }
              if (x === 'b') { return 2 }
              if (x === 'c') { return 3 }
            }
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '3', variable: 'x' },
            },
          ],
        },
        // Module-level (Program body)
        {
          code: `
            if (env === 'dev') log('dev')
            if (env === 'staging') log('staging')
            if (env === 'prod') log('prod')
          `,
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '3', variable: 'env' },
            },
          ],
        },
        // Custom threshold: 2
        {
          code: `
            function f(x) {
              if (x === 'a') return 1
              if (x === 'b') return 2
            }
          `,
          options: [{ threshold: 2 }],
          errors: [
            {
              messageId: 'preferJumpTable',
              data: { count: '2', variable: 'x' },
            },
          ],
        },
      ],
    })
  })
})
