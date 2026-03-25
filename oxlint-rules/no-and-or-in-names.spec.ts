/**
 * @fileoverview Tests for no-and-or-in-names rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import { createRequire } from 'node:module'

import rule from './no-and-or-in-names.js'

const require = createRequire(import.meta.url)

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
})

describe('no-and-or-in-names', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-and-or-in-names', rule, {
      valid: [
        // "Or" inside "Orders" - not a word boundary
        { code: 'const fetchOrders = () => {}' },
        // "And" inside "Android" - not a word boundary
        { code: 'const AndroidService = {}' },
        // "and" lowercase inside word
        { code: 'const randomValue = 42' },
        // "Or" inside "Organization" - not a word boundary
        { code: 'const setOrganization = () => {}' },
        // "and" inside "command" + "Handler"
        { code: 'const commandHandler = () => {}' },
        // "or" inside "record"
        { code: 'const recordEntry = {}' },
        // Regular names without And/Or
        { code: 'const myVariable = 1' },
        { code: 'function doSomething() {}' },
        { code: 'class MyService {}' },
        // References to names with And/Or should NOT trigger (only declarations)
        { code: 'console.log(saveAndNotify)' },
      ],

      invalid: [
        // Variable with "And"
        {
          code: 'const saveAndNotify = () => {}',
          errors: [
            {
              messageId: 'noAndOrInNames',
              data: { name: 'saveAndNotify', conjunction: 'And' },
            },
          ],
        },
        // Function with "Or"
        {
          code: 'function selectActiveOrScheduled() {}',
          errors: [
            {
              messageId: 'noAndOrInNames',
              data: { name: 'selectActiveOrScheduled', conjunction: 'Or' },
            },
          ],
        },
        // Class with "And"
        {
          code: 'class ReaderAndWriter {}',
          errors: [
            {
              messageId: 'noAndOrInNames',
              data: { name: 'ReaderAndWriter', conjunction: 'And' },
            },
          ],
        },
        // Type alias with "Or"
        {
          code: 'type ActiveOrScheduled = string',
          errors: [
            {
              messageId: 'noAndOrInNames',
              data: { name: 'ActiveOrScheduled', conjunction: 'Or' },
            },
          ],
        },
        // Interface with "And"
        {
          code: 'interface UserAndProfile {}',
          errors: [
            {
              messageId: 'noAndOrInNames',
              data: { name: 'UserAndProfile', conjunction: 'And' },
            },
          ],
        },
        // Enum with "Or"
        {
          code: 'enum ReadOrWrite {}',
          errors: [
            {
              messageId: 'noAndOrInNames',
              data: { name: 'ReadOrWrite', conjunction: 'Or' },
            },
          ],
        },
      ],
    })
  })
})
