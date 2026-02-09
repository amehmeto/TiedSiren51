/**
 * @fileoverview Tests for prefer-enum-over-string-union rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-enum-over-string-union.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-enum-over-string-union', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-enum-over-string-union', rule, {
      valid: [
        // Union with null - should skip
        {
          code: `type Status = 'active' | 'inactive' | null`,
        },
        // Union with undefined - should skip
        {
          code: `type Status = 'active' | 'inactive' | undefined`,
        },
        // Single string literal - less than minLiterals
        {
          code: `type Single = 'only'`,
        },
        // Mixed types (string | number) - not all string literals
        {
          code: `type Mixed = 'a' | 1`,
        },
        // Mixed types (string literal | string) - not all literals
        {
          code: `type Mixed = 'a' | string`,
        },
        // Inside Pick utility type (second param)
        {
          code: `type Picked = Pick<User, 'name' | 'email'>`,
        },
        // Inside Omit utility type (second param)
        {
          code: `type Omitted = Omit<User, 'password' | 'token'>`,
        },
        // Inside Record utility type (first param is key)
        {
          code: `type Mapped = Record<'a' | 'b', number>`,
        },
        // Inside Record utility type (value param - currently skipped as limitation)
        {
          code: `type Mapped = Record<string, 'success' | 'error'>`,
        },
        // Inside Extract utility type
        {
          code: `type Extracted = Extract<T, 'foo' | 'bar'>`,
        },
        // Inside Exclude utility type
        {
          code: `type Excluded = Exclude<T, 'foo' | 'bar'>`,
        },
        // All literals match ignored pattern
        {
          code: `type Icons = 'home-outline' | 'settings-outline'`,
          options: [{ ignoredPatterns: ['-outline$'] }],
        },
        // All literals match ignored pattern (logo prefix)
        {
          code: `type Logos = 'logo-google' | 'logo-apple'`,
          options: [{ ignoredPatterns: ['^logo-'] }],
        },
        // With higher minLiterals threshold
        {
          code: `type Status = 'active' | 'inactive'`,
          options: [{ minLiterals: 3 }],
        },
        // Empty union (edge case)
        {
          code: `type Empty = never`,
        },
        // Boolean literal union - not string
        {
          code: `type Bool = true | false`,
        },
        // Number literal union - not string
        {
          code: `type Nums = 1 | 2 | 3`,
        },
        // Nullable string (not literal union)
        {
          code: `type Name = string | null`,
        },
      ],
      invalid: [
        // Basic two-string union
        {
          code: `type Status = 'active' | 'inactive'`,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'active' | 'inactive'" },
            },
          ],
        },
        // Three-string union
        {
          code: `type Level = 'low' | 'medium' | 'high'`,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'low' | 'medium' | 'high'" },
            },
          ],
        },
        // Property type annotation
        {
          code: `
            interface Config {
              mode: 'development' | 'production'
            }
          `,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'development' | 'production'" },
            },
          ],
        },
        // Function parameter type
        {
          code: `
            function setMode(mode: 'light' | 'dark') {}
          `,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'light' | 'dark'" },
            },
          ],
        },
        // Return type annotation
        {
          code: `
            function getStatus(): 'pending' | 'complete' {
              return 'pending'
            }
          `,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'pending' | 'complete'" },
            },
          ],
        },
        // Not all literals match ignored pattern (partial match)
        {
          code: `type Icons = 'home-outline' | 'settings'`,
          options: [{ ignoredPatterns: ['-outline$'] }],
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'home-outline' | 'settings'" },
            },
          ],
        },
        // Variable with type annotation
        {
          code: `const direction: 'left' | 'right' = 'left'`,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'left' | 'right'" },
            },
          ],
        },
        // Generic type parameter constraint
        {
          code: `type Constrained<T extends 'a' | 'b'> = T`,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'a' | 'b'" },
            },
          ],
        },
        // Nested in array type
        {
          code: `type Statuses = ('active' | 'inactive')[]`,
          errors: [
            {
              messageId: 'preferEnum',
              data: { values: "'active' | 'inactive'" },
            },
          ],
        },
      ],
    })
  })
})
