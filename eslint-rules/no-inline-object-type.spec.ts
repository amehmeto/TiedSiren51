/**
 * @fileoverview Tests for no-inline-object-type rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-inline-object-type.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-inline-object-type', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-inline-object-type', rule, {
      valid: [
        // Named type alias used in type parameter - OK
        {
          code: `type Credentials = { email: string; password: string }`,
        },
        // Single property inline object - OK (under threshold)
        {
          code: `function foo(param: { name: string }) {}`,
        },
        // Interface declaration - OK
        {
          code: `interface Bar { name: string; age: number }`,
        },
        // Primitive type annotation - OK
        {
          code: `const x: string = 'hello'`,
        },
        // Custom threshold - under limit - OK
        {
          code: `function foo(param: { a: string; b: number }) {}`,
          options: [{ minProperties: 3 }],
        },
        // Union type alias at module scope - OK
        {
          code: `type Result = { ok: true; value: string } | { ok: false; error: string }`,
        },
        // Non-union type alias inside function - OK
        {
          code: `function foo() { type Name = string }`,
        },
      ],

      invalid: [
        // Inline object in type parameter - NOT OK
        {
          code: `declare function each<T>(cases: T[]): void; each<{ email: string; password: string }>([])`,
          errors: [{ messageId: 'extractObjectType' }],
        },
        // Inline object in function parameter - NOT OK
        {
          code: `function foo(param: { name: string; age: number }) {}`,
          errors: [{ messageId: 'extractObjectType' }],
        },
        // Inline object in variable type annotation - NOT OK
        {
          code: `const x: { name: string; age: number } = { name: 'a', age: 1 }`,
          errors: [{ messageId: 'extractObjectType' }],
        },
        // Inline object in return type - NOT OK
        {
          code: `function foo(): { name: string; age: number } { return { name: 'a', age: 1 } }`,
          errors: [{ messageId: 'extractObjectType' }],
        },
        // Custom lower threshold - NOT OK
        {
          code: `function foo(param: { name: string }) {}`,
          options: [{ minProperties: 1 }],
          errors: [{ messageId: 'extractObjectType' }],
        },
        // Union type alias inside function body - NOT OK
        {
          code: `function foo() { type Result = { ok: true } | { ok: false; error: string } }`,
          errors: [{ messageId: 'extractUnionType' }],
        },
        // Union type alias inside arrow function - NOT OK
        {
          code: `const foo = () => { type Status = { loading: true } | { loading: false; data: string } }`,
          errors: [{ messageId: 'extractUnionType' }],
        },
      ],
    })
  })
})
