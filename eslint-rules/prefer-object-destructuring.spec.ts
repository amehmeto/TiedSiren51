/**
 * @fileoverview Tests for prefer-object-destructuring rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-object-destructuring.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-object-destructuring', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-object-destructuring', rule, {
      valid: [
        // Single property access - OK
        {
          code: `
        function f() {
          return obj.a
        }
      `,
        },
        // Same property accessed multiple times (1 unique) - OK
        {
          code: `
        function f() {
          return obj.a + obj.a
        }
      `,
        },
        // Different objects - OK
        {
          code: `
        function f() {
          return a.x + b.y
        }
      `,
        },
        // Computed properties - OK
        {
          code: `
        function f() {
          return obj[a] + obj[b]
        }
      `,
        },
        // Assignment targets - OK
        {
          code: `
        function f() {
          obj.a = 1
          obj.b = 2
        }
      `,
        },
        // Method calls - OK
        {
          code: `
        function f() {
          obj.methodA()
          obj.methodB()
        }
      `,
        },
        // Ignored objects - OK
        {
          code: `
        function f() {
          return T.spacing + T.color
        }
      `,
          options: [{ ignoredObjects: ['T'] }],
        },
        // Nested member expression (object is not Identifier) - OK
        {
          code: `
        function f() {
          return a.b.c + a.b.d
        }
      `,
        },
        // Below custom threshold - OK
        {
          code: `
        function f() {
          return obj.a + obj.b
        }
      `,
          options: [{ threshold: 3 }],
        },
        // Different scopes - OK (each scope has only 1 unique property)
        {
          code: `
        function outer() {
          const x = obj.a
          const inner = () => {
            const y = obj.b
          }
        }
      `,
        },
        // Mixed: method call + property access = 1 property - OK
        {
          code: `
        function f() {
          obj.method()
          return obj.prop
        }
      `,
        },
      ],

      invalid: [
        // Two unique properties in same scope
        {
          code: `
        function f() {
          const x = obj.a
          const y = obj.b
        }
      `,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { object: 'obj', properties: 'a, b' },
            },
          ],
        },
        // Three unique properties
        {
          code: `
        function f() {
          const x = obj.a
          const y = obj.b
          return obj.c
        }
      `,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { object: 'obj', properties: 'a, b, c' },
            },
          ],
        },
        // Arrow function scope
        {
          code: `
        const f = () => {
          return params.x + params.y
        }
      `,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { object: 'params', properties: 'x, y' },
            },
          ],
        },
        // Property access alongside method call on result
        {
          code: `
        function f() {
          const list = sirens.android.map(x => x.id)
          const sites = sirens.websites
          const keys = sirens.keywords
        }
      `,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: {
                object: 'sirens',
                properties: 'android, websites, keywords',
              },
            },
          ],
        },
        // Function expression scope
        {
          code: `
        const f = function() {
          return params.x + params.y
        }
      `,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { object: 'params', properties: 'x, y' },
            },
          ],
        },
        // Module-level scope
        {
          code: `
        const x = config.host
        const y = config.port
      `,
          errors: [
            {
              messageId: 'preferDestructuring',
              data: { object: 'config', properties: 'host, port' },
            },
          ],
        },
      ],
    })
  })
})
