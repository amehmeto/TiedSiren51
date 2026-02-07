/**
 * @fileoverview Tests for reducer-in-domain-folder rule
 */

const { RuleTester } = require('eslint')
const rule = require('./reducer-in-domain-folder.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('reducer-in-domain-folder', rule, {
  valid: [
    // Correct location: core/domain/reducer.ts
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/core/auth/reducer.ts',
    },
    // Another valid domain
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/core/blocklist/reducer.ts',
    },
    // Multi-word domain
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/core/block-session/reducer.ts',
    },
    // Non-reducer file - should not apply
    {
      code: `export const something = {}`,
      filename: '/project/core/auth/auth.slice.ts',
    },
    // File not named reducer.ts - should not apply
    {
      code: `export const reducer = {}`,
      filename: '/project/core/auth/rootReducer.ts',
    },
    // node_modules - should skip
    {
      code: `export const reducer = {}`,
      filename: '/project/node_modules/package/reducer.ts',
    },
  ],

  invalid: [
    // Not in core - NOT OK
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/infra/auth/reducer.ts',
      errors: [
        {
          messageId: 'wrongLocation',
        },
      ],
    },
    // Directly in core (no domain folder) - NOT OK
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/core/reducer.ts',
      errors: [
        {
          messageId: 'wrongLocation',
        },
      ],
    },
    // Too deeply nested - NOT OK
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/core/auth/nested/reducer.ts',
      errors: [
        {
          messageId: 'wrongLocation',
        },
      ],
    },
    // In subfolder of domain - NOT OK
    {
      code: `export const reducer = combineReducers({})`,
      filename: '/project/core/auth/usecases/reducer.ts',
      errors: [
        {
          messageId: 'wrongLocation',
        },
      ],
    },
  ],
})
