/**
 * @fileoverview Tests for expect-separate-act-assert rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./expect-separate-act-assert.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('expect-separate-act-assert', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('expect-separate-act-assert', rule, {
      valid: [
        // Separated act and assert - OK
        {
          code: `
        const result = calculate(input)
        expect(result).toBe(expected)
      `,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Getter in expect - OK (allowed function)
        {
          code: `expect(getState()).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Selector in expect - OK (allowed function)
        {
          code: `expect(selectUser(state)).toBe(user)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // is* function in expect - OK
        {
          code: `expect(isActive(session)).toBe(true)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Simple identifier - OK
        {
          code: `expect(result).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Simple member expression (one level) - OK
        {
          code: `expect(result.value).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Literal value - OK
        {
          code: `expect(result).toBe(true)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Template literal - OK
        {
          code: 'expect(result).toBe(`expected-${id}`)',
          filename: '/project/core/auth/auth.test.ts',
        },
        // Negation - OK
        {
          code: `expect(!isActive).toBe(true)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Not a test file - should not apply
        {
          code: `expect(calculate(input)).toBe(expected)`,
          filename: '/project/core/auth/auth.ts',
        },
        // Empty array matcher argument - OK
        {
          code: `expect(result).toEqual([])`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Empty object matcher argument - OK
        {
          code: `expect(result).toEqual({})`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Array with simple identifiers - OK
        {
          code: `expect(result).toEqual([blocklist])`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // expect.any() matcher - OK
        {
          code: `expect(result).toEqual(expect.any(Object))`,
          filename: '/project/core/auth/auth.test.ts',
        },
      ],

      invalid: [
        // Function call in expect (not allowed) - NOT OK
        {
          code: `expect(calculate(input)).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'separateActAssert',
              data: { functionName: 'calculate' },
            },
          ],
        },
        // Await expression in expect - NOT OK
        {
          code: `expect(await fetchData()).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'separateActAssert',
              data: { functionName: 'fetchData' },
            },
          ],
        },
        // Deep property access - NOT OK
        {
          code: `expect(state.siren.availableSirens).toEqual([])`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractDeepProperty' }],
        },
        // Object literal in matcher - NOT OK
        {
          code: `expect(result).toEqual({ id: '123', name: 'test' })`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // Generic 'expected' variable name - NOT OK
        {
          code: `const expected = { id: '123' }`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'genericExpectedName' }],
        },
        // Complex array in matcher - NOT OK
        {
          code: `expect(result).toEqual([{ id: '1' }, { id: '2' }])`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // Function call in matcher - NOT OK
        {
          code: `expect(result).toEqual(createExpected())`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
      ],
    })
  })
})
