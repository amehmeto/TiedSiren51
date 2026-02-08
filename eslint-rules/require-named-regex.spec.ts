/**
 * @fileoverview Tests for require-named-regex rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./require-named-regex.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

describe('require-named-regex', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('require-named-regex', rule, {
      valid: [
        // Named constant for regex - OK
        {
          code: `const EMAIL_PATTERN = /^[^@]+@[^@]+$/`,
        },
        // Object property with regex - OK
        {
          code: `const patterns = { email: /^[^@]+@[^@]+$/ }`,
        },
        // Class property with regex - OK
        {
          code: `
        class Validator {
          static EMAIL_PATTERN = /^[^@]+@[^@]+$/
        }
      `,
        },
        // Named RegExp constructor - OK
        {
          code: `const DIGITS_PATTERN = new RegExp('^\\\\d+$')`,
        },
        // Regex in test file - OK (exception)
        {
          code: `const match = str.match(/\\d+/)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Regex in spec file - OK (exception)
        {
          code: `expect(str).toMatch(/error/)`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Regex in eslint-rules - OK (exception)
        {
          code: `const match = basename.match(/^select/)`,
          filename: '/project/eslint-rules/some-rule.cjs',
        },
      ],

      invalid: [
        // Inline regex literal - NOT OK
        {
          code: `const match = str.match(/^\\d{2}:\\d{2}$/)`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: {
                suggestedName: 'TIME_PATTERN',
                pattern: '/^\\d{2}:\\d{2}$/',
              },
            },
          ],
        },
        // Inline regex in condition - NOT OK
        {
          code: `if (/^\\d+$/.test(value)) {}`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: {
                suggestedName: 'DIGITS_ONLY_PATTERN',
                pattern: '/^\\d+$/',
              },
            },
          ],
        },
        // Inline new RegExp - NOT OK
        {
          code: `const match = str.match(new RegExp('^test'))`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: {
                suggestedName: 'PATTERN_REGEX',
                pattern: 'new RegExp("^test")',
              },
            },
          ],
        },
        // Inline regex in replace - NOT OK
        {
          code: `const result = str.replace(/\\s+/g, '-')`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: { suggestedName: 'PATTERN_REGEX', pattern: '/\\s+/g' },
            },
          ],
        },
        // Inline regex in split - NOT OK
        {
          code: `const parts = str.split(/,\\s*/)`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: { suggestedName: 'PATTERN_REGEX', pattern: '/,\\s*/' },
            },
          ],
        },
        // Email-like pattern - NOT OK
        {
          code: `const isEmail = /@/.test(value)`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: { suggestedName: 'EMAIL_PATTERN', pattern: '/@/' },
            },
          ],
        },
        // URL-like pattern - NOT OK (escaped slashes don't match the includes check)
        {
          code: `const isUrl = /https?:\\/\\//.test(value)`,
          errors: [
            {
              messageId: 'requireNamedRegex',
              data: {
                suggestedName: 'PATTERN_REGEX',
                pattern: '/https?:\\/\\//',
              },
            },
          ],
        },
      ],
    })
  })
})
