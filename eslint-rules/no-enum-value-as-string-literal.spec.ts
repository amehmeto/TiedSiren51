/**
 * @fileoverview Tests for no-enum-value-as-string-literal rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-enum-value-as-string-literal.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-enum-value-as-string-literal', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-enum-value-as-string-literal', rule, {
      valid: [
        // String literal not matching any enum
        {
          code: `
            enum Color { Red = 'red' }
            const x = color === 'blue'
          `,
        },
        // No enum in the file
        {
          code: `const x = mode === 'edit'`,
        },
        // Enum exists but comparison uses the enum member
        {
          code: `
            enum FormMode { Edit = 'edit' }
            const x = mode === FormMode.Edit
          `,
        },
        // Non-comparison operators
        {
          code: `
            enum Status { Active = 'active' }
            const x = 'active' + ' mode'
          `,
        },
        // Numeric enum values should not be flagged
        {
          code: `
            enum Priority { High = 1 }
            const x = priority === 1
          `,
        },
        // String literal in non-comparison context
        {
          code: `
            enum FormMode { Edit = 'edit' }
            const label = 'edit'
          `,
        },
      ],

      invalid: [
        // Direct match: mode === 'edit' when FormMode.Edit = 'edit'
        {
          code: `
            enum FormMode { Create = 'create', Edit = 'edit' }
            const isEdit = mode === 'edit'
          `,
          errors: [
            {
              messageId: 'useEnumValue',
              data: {
                enumName: 'FormMode',
                memberName: 'Edit',
                value: 'edit',
              },
            },
          ],
        },
        // !== operator
        {
          code: `
            enum Status { Active = 'active' }
            const isInactive = status !== 'active'
          `,
          errors: [
            {
              messageId: 'useEnumValue',
              data: {
                enumName: 'Status',
                memberName: 'Active',
                value: 'active',
              },
            },
          ],
        },
        // String literal on left side
        {
          code: `
            enum FormMode { Edit = 'edit' }
            const isEdit = 'edit' === mode
          `,
          errors: [
            {
              messageId: 'useEnumValue',
              data: {
                enumName: 'FormMode',
                memberName: 'Edit',
                value: 'edit',
              },
            },
          ],
        },
        // Multiple enum values - both should be caught
        {
          code: `
            enum FormMode { Create = 'create', Edit = 'edit' }
            const isCreate = mode === 'create'
            const isEdit = mode === 'edit'
          `,
          errors: [
            {
              messageId: 'useEnumValue',
              data: {
                enumName: 'FormMode',
                memberName: 'Create',
                value: 'create',
              },
            },
            {
              messageId: 'useEnumValue',
              data: {
                enumName: 'FormMode',
                memberName: 'Edit',
                value: 'edit',
              },
            },
          ],
        },
        // Enum defined after comparison (still caught at Program:exit)
        {
          code: `
            const isEdit = mode === 'edit'
            enum FormMode { Edit = 'edit' }
          `,
          errors: [
            {
              messageId: 'useEnumValue',
              data: {
                enumName: 'FormMode',
                memberName: 'Edit',
                value: 'edit',
              },
            },
          ],
        },
      ],
    })
  })
})
