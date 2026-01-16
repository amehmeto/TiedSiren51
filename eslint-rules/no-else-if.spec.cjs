/**
 * @fileoverview Tests for no-else-if rule
 */

const { RuleTester } = require('eslint')
const rule = require('./no-else-if.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('no-else-if', rule, {
  valid: [
    // Separate if statements - OK
    {
      code: `
        if (a) { doA() }
        if (b) { doB() }
      `,
    },
    // Simple if-else - OK
    {
      code: `
        if (a) {
          doA()
        } else {
          doB()
        }
      `,
    },
    // Nested if inside else block - OK
    {
      code: `
        if (a) {
          doA()
        } else {
          if (b) {
            doB()
          }
        }
      `,
    },
    // Just if, no else - OK
    {
      code: `
        if (a) {
          doA()
        }
      `,
    },
  ],

  invalid: [
    // else-if - NOT OK
    {
      code: `
        if (a) {
          doA()
        } else if (b) {
          doB()
        }
      `,
      errors: [{ messageId: 'noElseIf' }],
    },
    // Chained else-if - NOT OK (reports each else-if)
    {
      code: `
        if (a) {
          doA()
        } else if (b) {
          doB()
        } else if (c) {
          doC()
        }
      `,
      errors: [{ messageId: 'noElseIf' }, { messageId: 'noElseIf' }],
    },
    // else-if with final else - NOT OK
    {
      code: `
        if (a) {
          doA()
        } else if (b) {
          doB()
        } else {
          doC()
        }
      `,
      errors: [{ messageId: 'noElseIf' }],
    },
  ],
})
