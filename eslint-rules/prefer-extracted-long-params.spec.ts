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
        // Transparent wrapper with extracted inner arg - OK
        {
          code: `const payload = { id: blocklist.id, name: inputText }; dispatch(duplicateBlocklist(payload))`,
          options: [{ transparentWrappers: ['dispatch'] }],
        },
        // Transparent wrapper with short inner arg - OK
        {
          code: `dispatch(addWebsite(shortArg))`,
          options: [{ transparentWrappers: ['dispatch'] }],
        },
        // Transparent wrapper with no inner call - OK
        {
          code: `dispatch(someAction)`,
          options: [{ transparentWrappers: ['dispatch'] }],
        },
        // Transparent wrapper via member expression - OK
        {
          code: `const payload = { id: blocklist.id, name: inputText }; store.dispatch(duplicateBlocklist(payload))`,
          options: [{ transparentWrappers: ['dispatch'] }],
        },
      ],

      invalid: [
        // Long member expression with computed property - NOT OK
        {
          code: `new AuthError(FirebaseAuthGateway.FIREBASE_ERRORS[error.code])`,
          output: `const firebaseErrors = FirebaseAuthGateway.FIREBASE_ERRORS[error.code]\nnew AuthError(firebaseErrors)`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Multiple long arguments - both flagged (one fix per pass)
        {
          code: `new AuthError(FirebaseAuthGateway.FIREBASE_ERRORS[error.code], FirebaseAuthGateway.FIREBASE_ERROR_TYPES[error.code])`,
          output: `const firebaseErrors = FirebaseAuthGateway.FIREBASE_ERRORS[error.code]\nnew AuthError(firebaseErrors, FirebaseAuthGateway.FIREBASE_ERROR_TYPES[error.code])`,
          errors: [
            { messageId: 'extractParam' },
            { messageId: 'extractParam' },
          ],
        },
        // Long chained member expression - NOT OK
        {
          code: `fn(this.someService.someProperty.someMethod())`,
          output: `const someMethod = this.someService.someProperty.someMethod()\nfn(someMethod)`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Long conditional expression argument - NOT OK
        {
          code: `fn(someCondition ? SomeLongClass.longPropertyName : OtherLongClass.otherPropertyName)`,
          output: `const extracted = someCondition ? SomeLongClass.longPropertyName : OtherLongClass.otherPropertyName\nfn(extracted)`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Custom lower threshold - NOT OK
        {
          code: `fn(SomeClass.property[key])`,
          options: [{ maxArgumentLength: 20 }],
          output: `const property = SomeClass.property[key]\nfn(property)`,
          errors: [{ messageId: 'extractParam' }],
        },
        // new expression with long argument - NOT OK
        {
          code: `new SomeConstructor(SomeLongClassName.SOME_LONG_PROPERTY[code])`,
          output: `const someLongProperty = SomeLongClassName.SOME_LONG_PROPERTY[code]\nnew SomeConstructor(someLongProperty)`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Transparent wrapper flags long inner args (ignores allowedNodeTypes)
        {
          code: `dispatch(duplicateBlocklist({ id: blocklist.id, name: inputText, extra: somethingElse }))`,
          options: [{ transparentWrappers: ['dispatch'] }],
          output: `const payload = { id: blocklist.id, name: inputText, extra: somethingElse }\ndispatch(duplicateBlocklist(payload))`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Transparent wrapper with long inner member expression arg
        {
          code: `dispatch(addWebsite(event.nativeEvent.text.something.veryLong))`,
          options: [{ transparentWrappers: ['dispatch'] }],
          output: `const veryLong = event.nativeEvent.text.something.veryLong\ndispatch(addWebsite(veryLong))`,
          errors: [{ messageId: 'extractParam' }],
        },
        // Transparent wrapper via member expression with long inner arg
        {
          code: `store.dispatch(duplicateBlocklist({ id: blocklist.id, name: inputText, extra: somethingElse }))`,
          options: [{ transparentWrappers: ['dispatch'] }],
          output: `const payload = { id: blocklist.id, name: inputText, extra: somethingElse }\nstore.dispatch(duplicateBlocklist(payload))`,
          errors: [{ messageId: 'extractParam' }],
        },
        // No enclosing statement (export default) - no fix possible
        {
          code: `export default fn(this.someService.someProperty.someMethod())`,
          errors: [{ messageId: 'extractParam' }],
        },
      ],
    })
  })
})
