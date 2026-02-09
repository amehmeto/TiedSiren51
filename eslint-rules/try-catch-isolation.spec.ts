/**
 * @fileoverview Tests for try-catch-isolation rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./try-catch-isolation.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('try-catch-isolation', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('try-catch-isolation', rule, {
      valid: [
        // Try as first statement - OK
        {
          code: `
        function foo() {
          try {
            doSomething()
          } catch (e) {
            handleError(e)
          }
        }
      `,
        },
        // Try as first with return after - OK
        {
          code: `
        function foo() {
          try {
            doSomething()
          } catch (e) {
            handleError(e)
          }
          return result
        }
      `,
        },
        // Arrow function with try - OK
        {
          code: `
        const foo = () => {
          try {
            doSomething()
          } catch (e) {
            handleError(e)
          }
        }
      `,
        },
        // No try-catch at all - OK
        {
          code: `
        function foo() {
          doSomething()
          doSomethingElse()
        }
      `,
        },
        // Method definition - OK
        {
          code: `
        class Foo {
          bar() {
            try {
              doSomething()
            } catch (e) {
              handleError(e)
            }
          }
        }
      `,
        },
      ],

      invalid: [
        // Multiple try-catch blocks - NOT OK
        {
          code: `
        function foo() {
          try {
            doA()
          } catch (e) {
            handleA(e)
          }
          try {
            doB()
          } catch (e) {
            handleB(e)
          }
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
        // Try is not first statement - NOT OK
        {
          code: `
        function foo() {
          const x = 1
          try {
            doSomething()
          } catch (e) {
            handleError(e)
          }
        }
      `,
          errors: [{ messageId: 'tryNotFirst' }],
        },
        // Code after catch (not return) - NOT OK
        {
          code: `
        function foo() {
          try {
            doSomething()
          } catch (e) {
            handleError(e)
          }
          cleanup()
        }
      `,
          errors: [{ messageId: 'codeAfterCatch' }],
        },
        // Multiple try-catch in nested if - NOT OK
        {
          code: `
        function foo() {
          if (condition) {
            try {
              doA()
            } catch (e) {}
          } else {
            try {
              doB()
            } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
        // Try not first in if block - NOT OK
        {
          code: `
        function foo() {
          if (condition) {
            setup()
            try {
              doSomething()
            } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'tryNotFirst' }],
        },
        // Try not first in else block - NOT OK
        {
          code: `
        function foo() {
          if (condition) {
            return
          } else {
            setup()
            try {
              doSomething()
            } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'tryNotFirst' }],
        },
        // Try not first in else-if block - NOT OK
        {
          code: `
        function foo() {
          if (a) {
            return
          } else if (b) {
            setup()
            try {
              doSomething()
            } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'tryNotFirst' }],
        },
        // Code after catch in else block - NOT OK
        {
          code: `
        function foo() {
          if (condition) {
            return
          } else {
            try {
              doSomething()
            } catch (e) {}
            cleanup()
          }
        }
      `,
          errors: [{ messageId: 'codeAfterCatch' }],
        },
        // Multiple try in else-if - NOT OK
        {
          code: `
        function foo() {
          if (a) {
            try { doA() } catch (e) {}
          } else if (b) {
            try { doB() } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
        // Try as direct if consequent (no block) - NOT OK (multiple try-catch)
        {
          code: `
        function foo() {
          if (a)
            try { doA() } catch (e) {}
          else if (b)
            try { doB() } catch (e) {}
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
        // Try as direct else (no block) - counted with try in if block
        {
          code: `
        function foo() {
          if (a) {
            try { doA() } catch (e) {}
          } else
            try { doB() } catch (e) {}
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
        // Multiple try-catch inside a single if block - NOT OK
        {
          code: `
        function foo() {
          if (condition) {
            try { doA() } catch (e) {}
            try { doB() } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
        // Multiple try-catch inside else block - NOT OK
        {
          code: `
        function foo() {
          if (condition) {
            return
          } else {
            try { doA() } catch (e) {}
            try { doB() } catch (e) {}
          }
        }
      `,
          errors: [{ messageId: 'multipleTryCatch' }],
        },
      ],
    })
  })
})
