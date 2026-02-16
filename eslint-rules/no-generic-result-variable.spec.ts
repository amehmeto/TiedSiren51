/**
 * @fileoverview Tests for no-generic-result-variable rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-generic-result-variable.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-generic-result-variable', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-generic-result-variable', rule, {
      valid: [
        // Descriptive name derived from the action verb
        { code: 'const blockedCats = blockCats()' },
        // retrievedXxx pattern
        { code: 'const retrievedUser = selectUser(state)' },
        // Other descriptive names
        { code: 'const blocklistIds = selectBlocklistIds(state)' },
        // "result" as part of a longer name is fine
        { code: 'const searchResults = search(query)' },
        { code: 'const resultCount = getCount()' },
        // "response" is not in the default forbidden list
        { code: 'const response = await fetch(url)' },
        // Custom forbidden list: "result" is fine when not in custom list
        {
          code: 'const result = doSomething()',
          options: [{ forbidden: ['data'] }],
        },
        // Descriptive parameter name - should NOT report
        { code: 'function check(errorMessage) {}' },
        // "expected" as part of a longer name is fine
        { code: 'function check(expectedError) {}' },
        // Arrow function with descriptive param
        { code: 'const fn = (isoTimestamp) => isoTimestamp' },
        // Custom forbidden params: "expected" is fine when not in custom list
        {
          code: 'function check(expected) {}',
          options: [{ forbiddenParams: ['stuff'] }],
        },
      ],

      invalid: [
        {
          code: 'const result = selectBlocklistIds(state)',
          errors: [
            {
              messageId: 'noGenericResult',
              data: { name: 'result' },
            },
          ],
        },
        {
          code: 'const res = blockCats()',
          errors: [
            {
              messageId: 'noGenericResult',
              data: { name: 'res' },
            },
          ],
        },
        {
          code: 'const ret = getValue()',
          errors: [
            {
              messageId: 'noGenericResult',
              data: { name: 'ret' },
            },
          ],
        },
        {
          code: 'let output = await fetchUser()',
          errors: [
            {
              messageId: 'noGenericResult',
              data: { name: 'output' },
            },
          ],
        },
        // Custom forbidden list
        {
          code: 'const data = fetchData()',
          options: [{ forbidden: ['data'] }],
          errors: [
            {
              messageId: 'noGenericResult',
              data: { name: 'data' },
            },
          ],
        },
        // Generic parameter name in function declaration - SHOULD report
        {
          code: 'function check(expected) {}',
          errors: [
            {
              messageId: 'noGenericParam',
              data: { name: 'expected' },
            },
          ],
        },
        // Generic parameter name in arrow function - SHOULD report
        {
          code: 'const fn = (value) => value',
          errors: [
            {
              messageId: 'noGenericParam',
              data: { name: 'value' },
            },
          ],
        },
        // Generic parameter name in function expression - SHOULD report
        {
          code: 'const fn = function(data) { return data }',
          errors: [
            {
              messageId: 'noGenericParam',
              data: { name: 'data' },
            },
          ],
        },
        // Custom forbidden params
        {
          code: 'function check(stuff) {}',
          options: [{ forbiddenParams: ['stuff'] }],
          errors: [
            {
              messageId: 'noGenericParam',
              data: { name: 'stuff' },
            },
          ],
        },
      ],
    })
  })
})
