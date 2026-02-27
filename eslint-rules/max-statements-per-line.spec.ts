/**
 * @fileoverview Tests for max-statements-per-line rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./max-statements-per-line.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('max-statements-per-line', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('max-statements-per-line', rule, {
      valid: [
        // One statement per line - OK
        {
          code: `
const a = 1
const b = 2
`,
        },
        // Single statement - OK
        {
          code: `const a = 1`,
        },
        // Block with one statement per line - OK
        {
          code: `
function foo() {
  const a = 1
  const b = 2
  return a + b
}
`,
        },
        // Empty statement is ignored
        {
          code: `const a = 1;`,
        },
      ],

      invalid: [
        // Two statements on one line - NOT OK
        {
          code: `const a = 1; const b = 2`,
          errors: [
            {
              messageId: 'tooMany',
              data: { count: '2', max: '1' },
            },
          ],
        },
        // Three statements on one line - NOT OK
        {
          code: `const a = 1; const b = 2; const c = 3`,
          errors: [
            {
              messageId: 'tooMany',
              data: { count: '3', max: '1' },
            },
          ],
        },
        // Multiple statements in a block on one line - NOT OK
        {
          code: `
function foo() { const a = 1; const b = 2 }
`,
          errors: [
            {
              messageId: 'tooMany',
              data: { count: '2', max: '1' },
            },
          ],
        },
      ],
    })
  })
})
