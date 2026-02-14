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
        // Fixture file with separated act/assert - OK
        {
          code: `
            const { lastReauthenticatedAt } = store.getState().auth
            expect(lastReauthenticatedAt).toBe(expectedDate)
          `,
          filename: '/project/core/auth/authentification.fixture.ts',
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
        // has* function in expect - OK (allowed function)
        {
          code: `expect(hasItems(list)).toBe(true)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // can* function in expect - OK (allowed function)
        {
          code: `expect(canSubmit(form)).toBe(true)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Custom allowedFunctions option - OK
        {
          code: `expect(customFunc(input)).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
          options: [{ allowedFunctions: ['customFunc'] }],
        },
        // Chained method call with allowed getter - OK
        {
          code: `expect(store.getState().timer).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // .resolves modifier with variable - OK
        {
          code: `await expect(promise).resolves.toBe(result)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // .rejects modifier with variable - OK
        {
          code: `await expect(promise).rejects.toEqual(error)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Non-expect call with toEqual-like method - should not flag
        {
          code: `someObject.toEqual({ id: '123' })`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Array with spread element - OK
        {
          code: `expect(result).toEqual([...items])`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Literal value in array - OK
        {
          code: `expect(result).toEqual([1, 2, 3])`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // __tests__ directory - should apply rule
        {
          code: `
            const result = calculate(input)
            expect(result).toBe(expected)
          `,
          filename: '/project/__tests__/auth.ts',
        },
        // .not modifier - OK
        {
          code: `expect(result).not.toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // .not.toEqual with variable - OK
        {
          code: `expect(result).not.toEqual(expectedValue)`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // No argument to expect - OK (edge case)
        {
          code: `expect()`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // No argument to matcher - OK (edge case)
        {
          code: `expect(result).toBeUndefined()`,
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
        // .resolves with complex object - NOT OK
        {
          code: `await expect(promise).resolves.toEqual({ id: '123' })`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // .rejects with complex object - NOT OK
        {
          code: `await expect(promise).rejects.toEqual({ message: 'error' })`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // .not with complex object - NOT OK
        {
          code: `expect(result).not.toEqual({ id: '123' })`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // Chained method call without allowed function - NOT OK
        {
          code: `expect(obj.someMethod()).toBe(expected)`,
          filename: '/project/core/auth/auth.spec.ts',
          errors: [{ messageId: 'separateActAssert' }],
        },
        // Await in matcher argument - NOT OK
        {
          code: `expect(result).toEqual(await getExpected())`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // Array with complex objects - NOT OK
        {
          code: `expect(result).toContainEqual({ name: 'test' })`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // Deep property in matcher - with toMatchObject
        {
          code: `expect(result).toMatchObject({ id: '123' })`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractExpectedValue' }],
        },
        // Deep property access with three levels - NOT OK
        {
          code: `expect(state.user.profile.name).toBe('test')`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractDeepProperty' }],
        },
        // Deep property access with computed property - NOT OK
        {
          code: `expect(state.user[key].value).toBe('test')`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractDeepProperty' }],
        },
        // Deep property access with function call in chain - NOT OK
        {
          code: `expect(fn().property.value).toBe('test')`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractDeepProperty' }],
        },
        // Deep property access ending with numeric index - NOT OK
        {
          code: `expect(state.users.list[0]).toBe('test')`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'extractDeepProperty' }],
        },
        // Member expression function call - NOT OK
        {
          code: `expect(obj.calculate(input)).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'separateActAssert' }],
        },
        // IIFE in expect - NOT OK (null function name)
        {
          code: `expect((function() { return 1 })()).toBe(1)`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'separateActAssert' }],
        },
        // Chained method calls where inner function is NOT allowed - NOT OK
        {
          code: `expect(store.computeData().transform()).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'separateActAssert' }],
        },
        // Await allowed function still needs extraction - NOT OK
        {
          code: `expect(await computeResult()).toBe(expected)`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [{ messageId: 'separateActAssert' }],
        },
        // Fixture file with deep property access - NOT OK
        {
          code: `expect(state.auth.lastReauthenticatedAt).toBe(expectedDate)`,
          filename: '/project/core/auth/authentification.fixture.ts',
          errors: [{ messageId: 'extractDeepProperty' }],
        },
      ],
    })
  })
})
