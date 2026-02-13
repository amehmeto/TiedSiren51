/**
 * @fileoverview Tests for no-lame-naming rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-lame-naming.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-lame-naming', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-lame-naming', rule, {
      valid: [
        // Descriptive variable names
        { code: 'const sortedSirens = getSirens()' },
        { code: 'const blocklist = getBlocklist()' },
        { code: 'const androidApps = fetchApps()' },
        // "data" as part of a longer name is fine
        { code: 'const userData = getUser()' },
        { code: 'const dataProvider = createProvider()' },
        // "item" as part of a longer name is fine
        { code: 'const listItem = getFirst()' },
        { code: 'const menuItems = getMenu()' },
        // Descriptive function names
        { code: 'function sortSirens() {}' },
        { code: 'const fetchApps = () => {}' },
        // Callback parameters are allowed (e.g., .map, .filter)
        { code: 'list.map((item) => item.name)' },
        { code: 'list.filter((item) => item.active)' },
        { code: 'someFunction((item) => item.id)' },
        // Custom forbidden list: "data" is fine when not in custom list
        {
          code: 'const data = fetchData()',
          options: [{ forbiddenVariables: ['foo'] }],
        },
      ],

      invalid: [
        // Forbidden variable: data
        {
          code: 'const data = fetchData()',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'data' },
            },
          ],
        },
        // Forbidden variable: item
        {
          code: 'const item = getFirst()',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'item' },
            },
          ],
        },
        // Forbidden variable: items
        {
          code: 'const items = getAll()',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'items' },
            },
          ],
        },
        // Forbidden function pattern: compute
        {
          code: 'function computeSortedLists() {}',
          errors: [
            {
              messageId: 'noLameFunctionName',
              data: { name: 'computeSortedLists' },
            },
          ],
        },
        // Arrow function with forbidden pattern
        {
          code: 'const computeTotal = () => 42',
          errors: [
            {
              messageId: 'noLameFunctionName',
              data: { name: 'computeTotal' },
            },
          ],
        },
        // Function parameter (not callback)
        {
          code: 'function process(data: string) {}',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'data' },
            },
          ],
        },
        // Custom forbidden variables
        {
          code: 'const foo = getFoo()',
          options: [{ forbiddenVariables: ['foo'] }],
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'foo' },
            },
          ],
        },
        // Custom forbidden function patterns
        {
          code: 'function processData() {}',
          options: [{ forbiddenFunctionPatterns: ['process'] }],
          errors: [
            {
              messageId: 'noLameFunctionName',
              data: { name: 'processData' },
            },
          ],
        },
      ],
    })
  })
})
