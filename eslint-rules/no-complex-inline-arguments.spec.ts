/**
 * @fileoverview Tests for no-complex-inline-arguments rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-complex-inline-arguments.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-complex-inline-arguments', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-complex-inline-arguments', rule, {
      valid: [
        // Simple identifier argument - OK
        {
          code: `showToast(message)`,
        },
        // Short string in logical expression - OK (under default 20 chars)
        {
          code: `showToast(foo ?? 'Short')`,
        },
        // Simple string literal argument - OK (no operator)
        {
          code: `showToast('This is a very long string that would normally be flagged')`,
        },
        // Logical expression without string - OK
        {
          code: `getValue(foo ?? bar)`,
        },
        // Binary expression without long string - OK
        {
          code: `concat(a + b)`,
        },
        // Conditional expression with short strings - OK
        {
          code: `show(x ? 'yes' : 'no')`,
        },
        // Long string but in allowed function - OK
        {
          code: `translate(foo ?? 'This is a very long default message')`,
          options: [{ allowedFunctions: ['translate'] }],
        },
        // Not a call expression - OK
        {
          code: `const x = foo ?? 'This is a very long default message'`,
        },
        // Custom threshold - under limit - OK
        {
          code: `showToast(foo ?? 'This is exactly thirty chars!')`,
          options: [{ maxStringLength: 30 }],
        },
        // Member expression call with short string - OK
        {
          code: `obj.method(foo ?? 'Short')`,
        },
        // Nested but inner is simple - OK
        {
          code: `outer(inner(foo ?? bar))`,
        },
        // Array argument - OK
        {
          code: `fn([foo ?? 'long string here that is very long'])`,
        },
        // Object argument - OK
        {
          code: `fn({ key: foo ?? 'long string here that is very long' })`,
        },
        // Arrow function argument - OK
        {
          code: `fn(() => foo ?? 'long string here that is very long')`,
        },
        // No arguments - OK
        {
          code: `showToast()`,
        },
        // Template literal under threshold - OK
        {
          code: 'fn(foo ?? `short`)',
        },
      ],

      invalid: [
        // Logical expression with long string - NOT OK
        {
          code: `showToast(foo ?? 'This action is currently disabled')`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Binary expression with long string - NOT OK
        {
          code: `log(prefix + 'This is a very long suffix string')`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Conditional expression with long string - NOT OK
        {
          code: `show(condition ? 'This is a very long true message' : fallback)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // || operator with long string - NOT OK
        {
          code: `display(value || 'Default value that is quite long')`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // && operator with long string - NOT OK
        {
          code: `render(isValid && 'This validation message is long')`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Nested logical with long string - NOT OK
        {
          code: `fn(a ?? b ?? 'This is a very long fallback string')`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Member expression call - NOT OK
        {
          code: `obj.method(foo ?? 'This is a very long default value')`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Multiple complex args - both flagged
        {
          code: `fn(a ?? 'First long string message', b || 'Second long string message')`,
          errors: [
            { messageId: 'extractArgument' },
            { messageId: 'extractArgument' },
          ],
        },
        // Custom lower threshold - NOT OK
        {
          code: `showToast(foo ?? 'Medium length')`,
          options: [{ maxStringLength: 10 }],
          errors: [{ messageId: 'extractArgument' }],
        },
        // Template literal over threshold - NOT OK
        {
          code: 'fn(foo ?? `This is a very long template string`)',
          errors: [{ messageId: 'extractArgument' }],
        },
        // Conditional with long string in alternate - NOT OK
        {
          code: `show(condition ? short : 'This is a very long alternate string')`,
          errors: [{ messageId: 'extractArgument' }],
        },
      ],
    })
  })
})
