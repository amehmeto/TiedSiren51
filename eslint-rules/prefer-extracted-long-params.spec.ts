/**
 * @fileoverview Tests for prefer-extracted-long-params rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-extracted-long-params.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-extracted-long-params', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-extracted-long-params', rule, {
      valid: [
        // Simple identifier arguments - OK
        {
          code: `new AuthError(message, errorType)`,
        },
        // Short member expression - OK (under 40 chars)
        {
          code: `new AuthError(ERRORS[code], TYPES[code])`,
        },
        // Literal arguments - OK
        {
          code: `fn('hello', 42, true)`,
        },
        // Spread element - OK
        {
          code: `fn(...args)`,
        },
        // Arrow function argument - OK
        {
          code: `items.map((item) => item.name + item.value + item.extra)`,
        },
        // Object argument - OK
        {
          code: `fn({ key: SomeLongClassName.SOME_LONG_PROPERTY[code] })`,
        },
        // Array argument - OK
        {
          code: `fn([SomeLongClassName.SOME_LONG_PROPERTY[code]])`,
        },
        // No arguments - OK
        {
          code: `fn()`,
        },
        // Extracted into variables - OK
        {
          code: `
            const errorMessage = FirebaseAuthGateway.FIREBASE_ERRORS[error.code]
            const errorType = FirebaseAuthGateway.FIREBASE_ERROR_TYPES[error.code]
            new AuthError(errorMessage, errorType)
          `,
        },
        // Custom threshold - under limit - OK
        {
          code: `fn(SomeLongClassName.SOME_LONG_PROPERTY[code])`,
          options: [{ maxArgumentLength: 60 }],
        },
        // Unary expression - OK
        {
          code: `fn(!someVeryLongVariableNameThatExceedsTheThreshold)`,
        },
      ],

      invalid: [
        // Long member expression with computed property - NOT OK
        {
          code: `new AuthError(FirebaseAuthGateway.FIREBASE_ERRORS[error.code])`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Multiple long arguments - both flagged
        {
          code: `new AuthError(FirebaseAuthGateway.FIREBASE_ERRORS[error.code], FirebaseAuthGateway.FIREBASE_ERROR_TYPES[error.code])`,
          errors: [
            { messageId: 'extractParam' },
            { messageId: 'extractParam' },
          ],
        },
        // Long chained member expression - NOT OK
        {
          code: `fn(this.someService.someProperty.someMethod())`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Long conditional expression argument - NOT OK
        {
          code: `fn(someCondition ? SomeLongClass.longPropertyName : OtherLongClass.otherPropertyName)`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Custom lower threshold - NOT OK
        {
          code: `fn(SomeClass.property[key])`,
          options: [{ maxArgumentLength: 20 }],
          errors: [{ messageId: 'extractParam' }],
        },
        // new expression with long argument - NOT OK
        {
          code: `new SomeConstructor(SomeLongClassName.SOME_LONG_PROPERTY[code])`,
          errors: [{ messageId: 'extractParam' }],
        },
      ],
    })
  })
})
