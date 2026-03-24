/**
 * @fileoverview Tests for max-statements-per-line rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './max-statements-per-line.js'

const ruleTester = new RuleTester({
  languageOptions: {
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
        // Two statements allowed with max: 2 option
        {
          code: `const a = 1; const b = 2`,
          options: [{ max: 2 }],
        },
        // Empty statements are skipped
        {
          code: `;;; const a = 1`,
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
