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
        // "result" as part of a longer name is fine
        { code: 'const validationResult = schema.safeParse(input)' },
        // Descriptive function names
        { code: 'function sortSirens() {}' },
        { code: 'const fetchApps = () => {}' },
        // Custom forbidden list: "data" is fine when not in custom list
        {
          code: 'const data = fetchData()',
          options: [{ forbiddenVariables: ['foo'] }],
        },
        // Object method with descriptive name is fine
        { code: 'const obj = { sortSirens() { return [] } }' },
        // Arrow function param with allowed name is fine
        { code: 'const fn = (user) => user.name' },
        // Destructuring variable declarator (not Identifier)
        { code: 'const { data } = getResponse()' },
        // Arrow function with destructured param (not Identifier)
        { code: 'const fn = ({ data }) => data.toString()' },
        // Export default anonymous function (no id)
        { code: 'export default function() {}' },
        // Destructuring in arrow function variable declarator (id is not Identifier)
        { code: 'const { length } = () => {}' },
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
        // Forbidden variable: result
        {
          code: 'const result = schema.safeParse(input)',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'result' },
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
        // Object method with forbidden function pattern
        {
          code: 'const obj = { computeTotal() { return 42 } }',
          errors: [
            {
              messageId: 'noLameFunctionName',
              data: { name: 'computeTotal' },
            },
          ],
        },
        // Arrow function parameter with forbidden name (not a callback)
        {
          code: 'const fn = (data) => data.toString()',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'data' },
            },
          ],
        },
        // Callback parameters with forbidden names are also flagged
        {
          code: 'list.map((item) => item.name)',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'item' },
            },
          ],
        },
        {
          code: 'list.filter((item) => item.active)',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'item' },
            },
          ],
        },
        {
          code: 'someFunction((item) => item.id)',
          errors: [
            {
              messageId: 'noLameVariableName',
              data: { name: 'item' },
            },
          ],
        },
      ],
    })
  })
})
