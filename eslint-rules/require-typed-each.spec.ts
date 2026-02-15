/**
 * @fileoverview Tests for require-typed-each rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./require-typed-each.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('require-typed-each', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('require-typed-each', rule, {
      valid: [
        // it.each with type parameter - OK
        {
          code: `it.each<[string, number]>([['a', 1]])('test %s', (str, num) => {})`,
        },
        // test.each with type parameter - OK
        {
          code: `test.each<[string]>([['a']])('test %s', (str) => {})`,
        },
        // describe.each with type parameter - OK
        {
          code: `describe.each<[string]>([['a']])('suite %s', (str) => {})`,
        },
        // Regular it call (not .each) - OK
        {
          code: `it('test', () => {})`,
        },
        // Regular describe call - OK
        {
          code: `describe('suite', () => {})`,
        },
        // Method named each on non-test object - OK
        {
          code: `arr.each([1, 2, 3])`,
        },
      ],

      invalid: [
        // it.each without type parameter - NOT OK
        {
          code: `it.each([['a', 1]])('test %s', (str, num) => {})`,
          errors: [{ messageId: 'requireTypeParam' }],
        },
        // test.each without type parameter - NOT OK
        {
          code: `test.each([['a']])('test %s', (str) => {})`,
          errors: [{ messageId: 'requireTypeParam' }],
        },
        // describe.each without type parameter - NOT OK
        {
          code: `describe.each([['a']])('suite %s', (str) => {})`,
          errors: [{ messageId: 'requireTypeParam' }],
        },
      ],
    })
  })
})
