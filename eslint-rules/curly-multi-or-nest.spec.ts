/**
 * @fileoverview Tests for curly-multi-or-nest rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./curly-multi-or-nest.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('curly-multi-or-nest', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('curly-multi-or-nest', rule, {
      valid: [
        // Single statement without braces - OK
        {
          code: `if (x) doSomething()`,
        },
        // Multi-statement with braces - OK
        {
          code: `
if (x) {
  doA()
  doB()
}
`,
        },
        // Braces around nested control flow - OK
        {
          code: `
if (x) {
  if (y) doSomething()
}
`,
        },
        // While loop without braces, single statement - OK
        {
          code: `while (x) doSomething()`,
        },
        // For loop without braces, single statement - OK
        {
          code: `for (let i = 0; i < 10; i++) doSomething()`,
        },
      ],

      invalid: [
        // Braces around single non-nested statement - NOT OK
        {
          code: `if (x) { doSomething() }`,
          errors: [{ messageId: 'unnecessaryBraces', data: { keyword: 'if' } }],
        },
        // Nested control flow without braces - NOT OK (needs braces)
        {
          code: `if (x) if (y) doSomething()`,
          errors: [{ messageId: 'needsBraces', data: { keyword: 'if' } }],
        },
        // While with unnecessary braces around single statement - NOT OK
        {
          code: `while (x) { doSomething() }`,
          errors: [
            { messageId: 'unnecessaryBraces', data: { keyword: 'while' } },
          ],
        },
        // For with unnecessary braces around single statement - NOT OK
        {
          code: `for (let i = 0; i < 10; i++) { doSomething() }`,
          errors: [
            { messageId: 'unnecessaryBraces', data: { keyword: 'for' } },
          ],
        },
        // Else with unnecessary braces around single statement - NOT OK
        {
          code: `
if (x) doA()
else { doB() }
`,
          errors: [
            { messageId: 'unnecessaryBraces', data: { keyword: 'else' } },
          ],
        },
      ],
    })
  })
})
