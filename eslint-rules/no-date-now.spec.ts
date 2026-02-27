/**
 * @fileoverview Tests for no-date-now rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-date-now.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-date-now', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-date-now', rule, {
      valid: [
        {
          code: `const now = dateProvider.getNowMs()`,
        },
        {
          code: `const date = new Date()`,
        },
        {
          code: `const timestamp = performance.now()`,
        },
      ],

      invalid: [
        {
          code: `const now = Date.now()`,
          errors: [{ messageId: 'noDateNow' }],
        },
        {
          code: `setNow(Date.now())`,
          errors: [{ messageId: 'noDateNow' }],
        },
        {
          code: `const elapsed = Date.now() - startTime`,
          errors: [{ messageId: 'noDateNow' }],
        },
      ],
    })
  })
})
