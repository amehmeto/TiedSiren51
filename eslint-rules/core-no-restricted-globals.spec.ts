/**
 * @fileoverview Tests for core-no-restricted-globals rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./core-no-restricted-globals.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('core-no-restricted-globals', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('core-no-restricted-globals', rule, {
      valid: [
        // Using a provider instead of Date - OK
        {
          code: `const now = dateProvider.getNow()`,
          filename: '/project/core/block-session/block-session.slice.ts',
        },
        // Using a provider instead of fetch - OK
        {
          code: `const result = gateway.fetchData()`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Date used in test file - OK (excluded)
        {
          code: `const now = new Date()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Date used in fixture file - OK (excluded)
        {
          code: `const now = new Date()`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // Date used in ports - OK (excluded)
        {
          code: `const now = new Date()`,
          filename: '/project/core/_ports_/date-provider.ts',
        },
        // Date used outside core - OK (not scoped)
        {
          code: `const now = new Date()`,
          filename: '/project/infra/date-provider/real-date-provider.ts',
        },
        // Date as a property access (obj.Date) - OK
        {
          code: `const val = obj.Date`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Date as variable declaration (const Date = ...) - OK
        {
          code: `const Date = createDateProvider()`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Date in builder file - OK (excluded)
        {
          code: `const now = new Date()`,
          filename: '/project/core/auth/auth.builder.ts',
        },
      ],

      invalid: [
        // Using Date global in core - NOT OK
        {
          code: `const now = new Date()`,
          filename: '/project/core/block-session/block-session.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use DateProvider dependency instead of Date in core.',
              },
            },
          ],
        },
        // Using setTimeout in core - NOT OK
        {
          code: `setTimeout(() => {}, 1000)`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use TimerProvider dependency instead of setTimeout in core.',
              },
            },
          ],
        },
        // Using fetch in core - NOT OK
        {
          code: `const data = fetch('/api/data')`,
          filename: '/project/core/siren/siren.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use a Repository/Gateway dependency instead of fetch in core.',
              },
            },
          ],
        },
        // Using navigator in core - NOT OK
        {
          code: `const lang = navigator.language`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use a DeviceProvider dependency instead of navigator in core.',
              },
            },
          ],
        },
        // Using localStorage in core - NOT OK
        {
          code: `localStorage.getItem('key')`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use a Repository dependency instead of localStorage in core.',
              },
            },
          ],
        },
      ],
    })
  })
})
