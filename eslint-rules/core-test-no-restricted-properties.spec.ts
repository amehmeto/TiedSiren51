/**
 * @fileoverview Tests for core-test-no-restricted-properties rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./core-test-no-restricted-properties.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('core-test-no-restricted-properties', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('core-test-no-restricted-properties', rule, {
      valid: [
        // Using dependency injection instead of vi.spyOn - OK
        {
          code: `const mock = createMock()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Using fake timers via provider - OK
        {
          code: `const dateProvider = new FakeDateProvider()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // vi.spyOn outside core - OK (not scoped)
        {
          code: `vi.spyOn(obj, 'method')`,
          filename: '/project/infra/auth-gateway/auth-gateway.spec.ts',
        },
        // vi.spyOn in non-test core file - OK (not scoped to production)
        {
          code: `vi.spyOn(obj, 'method')`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // vi.spyOn in UI test - OK (not scoped)
        {
          code: `vi.spyOn(obj, 'method')`,
          filename: '/project/ui/screens/Home/Home.spec.ts',
        },
        // Regular method call on vi - OK (not restricted)
        {
          code: `vi.fn()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
      ],

      invalid: [
        // vi.spyOn in core test - NOT OK
        {
          code: `vi.spyOn(obj, 'method')`,
          filename: '/project/core/auth/auth.spec.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Use dependency injection (fakes/stubs) instead of vi.spyOn() in core tests.',
              },
            },
          ],
        },
        // vi.useFakeTimers in core test - NOT OK
        {
          code: `vi.useFakeTimers()`,
          filename: '/project/core/block-session/block-session.spec.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Use DateProvider dependency injection instead of vi.useFakeTimers() in core tests.',
              },
            },
          ],
        },
        // vi.useRealTimers in core test - NOT OK
        {
          code: `vi.useRealTimers()`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Use DateProvider dependency injection instead of vi.useRealTimers() in core tests.',
              },
            },
          ],
        },
        // jest.spyOn in core test - NOT OK
        {
          code: `jest.spyOn(obj, 'method')`,
          filename: '/project/core/auth/auth.spec.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Use dependency injection (fakes/stubs) instead of jest.spyOn() in core tests.',
              },
            },
          ],
        },
        // jest.useFakeTimers in core test - NOT OK
        {
          code: `jest.useFakeTimers()`,
          filename: '/project/core/siren/siren.spec.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Use DateProvider dependency injection instead of jest.useFakeTimers() in core tests.',
              },
            },
          ],
        },
      ],
    })
  })
})
