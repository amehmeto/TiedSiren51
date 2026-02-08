/**
 * @fileoverview Tests for time-constant-multiplication rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./time-constant-multiplication.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('time-constant-multiplication', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('time-constant-multiplication', rule, {
      valid: [
        // Correct multiplier format - OK
        {
          code: `const duration = 30 * MINUTE`,
        },
        // Multiple time constants with multipliers - OK
        {
          code: `const duration = 1 * HOUR + 30 * MINUTE`,
        },
        // Variable multiplier - OK
        {
          code: `const duration = minutes * MINUTE`,
        },
        // All time constants with multipliers - OK
        {
          code: `
        const ms = 100 * MILLISECOND
        const sec = 30 * SECOND
        const min = 15 * MINUTE
        const hr = 2 * HOUR
        const day = 1 * DAY
      `,
        },
        // Import statement - OK
        {
          code: `import { MINUTE, HOUR } from './constants'`,
        },
        // Variable declaration (defining the constant) - OK
        {
          code: `const MINUTE = 60000`,
        },
        // Property access - OK
        {
          code: `const value = time.MINUTE`,
        },
      ],

      invalid: [
        // HOUR without multiplier - NOT OK
        {
          code: `const duration = HOUR`,
          errors: [
            {
              messageId: 'missingMultiplier',
              data: { name: 'HOUR' },
            },
          ],
          output: `const duration = 1 * HOUR`,
        },
        // MINUTE without multiplier in addition - NOT OK
        {
          code: `const duration = HOUR + 30 * MINUTE`,
          errors: [
            {
              messageId: 'missingMultiplier',
              data: { name: 'HOUR' },
            },
          ],
          output: `const duration = 1 * HOUR + 30 * MINUTE`,
        },
        // Time constant on left side of multiplication - NOT OK
        {
          code: `const duration = MINUTE * 30`,
          errors: [
            {
              messageId: 'missingMultiplier',
              data: { name: 'MINUTE' },
            },
          ],
          output: `const duration = 30 * MINUTE`,
        },
        // Time constant in division (needs parentheses) - NOT OK
        {
          code: `const minutes = ms / MINUTE`,
          errors: [
            {
              messageId: 'missingMultiplier',
              data: { name: 'MINUTE' },
            },
          ],
          output: `const minutes = ms / (1 * MINUTE)`,
        },
        // Multiple missing multipliers - NOT OK
        {
          code: `const duration = HOUR + MINUTE`,
          errors: [
            { messageId: 'missingMultiplier', data: { name: 'HOUR' } },
            { messageId: 'missingMultiplier', data: { name: 'MINUTE' } },
          ],
          output: `const duration = 1 * HOUR + 1 * MINUTE`,
        },
        // SECOND without multiplier - NOT OK
        {
          code: `const delay = SECOND`,
          errors: [
            {
              messageId: 'missingMultiplier',
              data: { name: 'SECOND' },
            },
          ],
          output: `const delay = 1 * SECOND`,
        },
        // DAY without multiplier - NOT OK
        {
          code: `const expiry = DAY`,
          errors: [
            {
              messageId: 'missingMultiplier',
              data: { name: 'DAY' },
            },
          ],
          output: `const expiry = 1 * DAY`,
        },
      ],
    })
  })
})
