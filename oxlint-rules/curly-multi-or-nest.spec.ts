/**
 * @fileoverview Tests for curly-multi-or-nest rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './curly-multi-or-nest.js'

const ruleTester = new RuleTester({
  languageOptions: {
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
        // For-in without braces, single statement - OK
        {
          code: `for (const k in obj) doSomething(k)`,
        },
        // For-of without braces, single statement - OK
        {
          code: `for (const x of arr) doSomething(x)`,
        },
        // Do-while with braces (multi-statement) - OK
        {
          code: `
do {
  doA()
  doB()
} while (x)
`,
        },
        // Braces around single multi-line statement - OK (readability exception)
        {
          code: `
if (x) {
  doSomething(
    a,
    b
  )
}
`,
        },
        // Braces around nested block in block - OK (multiple statements)
        {
          code: `
if (x) {
  if (y) doA()
  doB()
}
`,
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
        // For-in with unnecessary braces - NOT OK
        {
          code: `for (const k in obj) { doSomething(k) }`,
          errors: [
            { messageId: 'unnecessaryBraces', data: { keyword: 'for-in' } },
          ],
        },
        // Do-while with unnecessary braces around single statement - NOT OK
        {
          code: `do { doSomething() } while (x)`,
          errors: [
            { messageId: 'unnecessaryBraces', data: { keyword: 'do-while' } },
          ],
        },
      ],
    })
  })
})
