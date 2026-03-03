/**
 * @fileoverview Tests for object-shorthand rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './object-shorthand.js'

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('object-shorthand', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('object-shorthand', rule, {
      valid: [
        // Property shorthand already used - OK
        {
          code: `const obj = { x }`,
        },
        // Method shorthand already used - OK
        {
          code: `const obj = { fn() {} }`,
        },
        // Different key and value - OK
        {
          code: `const obj = { x: y }`,
        },
        // Computed property with same-name value - OK (skipped)
        {
          code: `const obj = { [key]: key }`,
        },
        // Getter - OK (method flag already set)
        {
          code: `const obj = { get x() { return 1 } }`,
        },
      ],

      invalid: [
        // Property shorthand possible: { x: x } - NOT OK
        {
          code: `const obj = { x: x }`,
          errors: [{ messageId: 'useShorthand', data: { name: 'x' } }],
          output: `const obj = { x }`,
        },
        // Multiple shorthand violations - NOT OK
        {
          code: `const obj = { a: a, b: b }`,
          errors: [
            { messageId: 'useShorthand', data: { name: 'a' } },
            { messageId: 'useShorthand', data: { name: 'b' } },
          ],
          output: `const obj = { a, b }`,
        },
        // Mixed shorthand and non-shorthand - NOT OK for the non-shorthand
        {
          code: `const obj = { a, b: b, c: d }`,
          errors: [{ messageId: 'useShorthand', data: { name: 'b' } }],
          output: `const obj = { a, b, c: d }`,
        },
        // Method shorthand possible: { fn: function() {} } - NOT OK
        {
          code: `const obj = { fn: function() { return 1 } }`,
          errors: [{ messageId: 'useMethodShorthand', data: { name: 'fn' } }],
          output: `const obj = { fn() { return 1 } }`,
        },
        // Async method shorthand possible - NOT OK
        {
          code: `const obj = { fn: async function(a, b) { return a } }`,
          errors: [{ messageId: 'useMethodShorthand', data: { name: 'fn' } }],
          output: `const obj = { async fn(a, b) { return a } }`,
        },
      ],
    })
  })
})
