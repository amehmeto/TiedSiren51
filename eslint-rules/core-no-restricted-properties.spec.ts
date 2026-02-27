/**
 * @fileoverview Tests for core-no-restricted-properties rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./core-no-restricted-properties.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('core-no-restricted-properties', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('core-no-restricted-properties', rule, {
      valid: [
        // Using a provider instead of Math.random - OK
        {
          code: `const val = randomProvider.random()`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Using a provider instead of process.env - OK
        {
          code: `const env = configProvider.get('API_URL')`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Math.random outside core - OK (not scoped)
        {
          code: `const val = Math.random()`,
          filename: '/project/infra/random-provider/real-random-provider.ts',
        },
        // Math.random in test file - OK (excluded)
        {
          code: `const val = Math.random()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Math.random in fixture file - OK (excluded)
        {
          code: `const val = Math.random()`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // Math.random in ports - OK (excluded)
        {
          code: `const val = Math.random()`,
          filename: '/project/core/_ports_/random-provider.ts',
        },
        // Math.random in builder - OK (excluded)
        {
          code: `const val = Math.random()`,
          filename: '/project/core/auth/auth.builder.ts',
        },
        // Non-restricted property access - OK
        {
          code: `const val = Math.floor(1.5)`,
          filename: '/project/core/auth/auth.slice.ts',
        },
      ],

      invalid: [
        // Math.random in core production - NOT OK
        {
          code: `const val = Math.random()`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use RandomProvider dependency instead of Math.random() in core.',
              },
            },
          ],
        },
        // process.env in core production - NOT OK
        {
          code: `const apiUrl = process.env.API_URL`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use ConfigProvider dependency instead of process.env in core.',
              },
            },
          ],
        },
        // window.location in core production - NOT OK
        {
          code: `const url = window.location.href`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use RouterProvider dependency instead of window.location in core.',
              },
            },
          ],
        },
        // window.localStorage in core production - NOT OK
        {
          code: `const data = window.localStorage.getItem('key')`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use a Repository dependency instead of window.localStorage in core.',
              },
            },
          ],
        },
        // window.sessionStorage in core production - NOT OK
        {
          code: `const data = window.sessionStorage.getItem('key')`,
          filename: '/project/core/blocklist/blocklist.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use a Repository dependency instead of window.sessionStorage in core.',
              },
            },
          ],
        },
      ],
    })
  })
})
