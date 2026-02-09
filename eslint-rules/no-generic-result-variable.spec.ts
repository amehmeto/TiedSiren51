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
      ],

      invalid: [
        {
          code: 'const result = selectBlocklistIds(state)',
          errors: [{ messageId: 'noGenericResult' }],
        },
        {
          code: 'const result = blockCats()',
          errors: [{ messageId: 'noGenericResult' }],
        },
        {
          code: 'let result = await fetchUser()',
          errors: [{ messageId: 'noGenericResult' }],
        },
      ],
    })
  })
})
