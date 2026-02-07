/**
 * @fileoverview Tests for try-catch-isolation rule
 */

const { RuleTester } = require('eslint')
const rule = require('./try-catch-isolation.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

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
  ],
})
