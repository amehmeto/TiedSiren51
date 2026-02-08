/**
 * @fileoverview Tests for selector-state-first-param rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./selector-state-first-param.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('selector-state-first-param', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('selector-state-first-param', rule, {
      valid: [
        // State as first param
        {
          code: 'export const selectFoo = (state) => state.foo',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
        // State as first param with other params
        {
          code: 'export const selectFoo = (state, dateProvider, id) => state.foo',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
        // Function declaration
        {
          code: 'export function selectFoo(state) { return state.foo }',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
        // Not a selector file - should be ignored
        {
          code: 'export const selectFoo = (dateProvider, state) => state.foo',
          filename: '/core/foo/usecases/something.ts',
        },
        // Not a selector function - should be ignored
        {
          code: 'export const getFoo = (dateProvider, state) => state.foo',
          filename: '/core/foo/selectors/getFoo.ts',
        },
        // createSelector - should be ignored (uses different pattern)
        {
          code: 'export const selectFoo = createSelector([selectBar], (bar) => bar.baz)',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
        // No params - edge case, should be ignored
        {
          code: 'export const selectFoo = () => "constant"',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
        // Not in selectors folder - should be skipped
        {
          code: 'export const selectFoo = (id, state) => state.foo',
          filename: '/core/foo/utils/selectFoo.ts',
        },
        // FunctionExpression with state first - OK
        {
          code: 'export const selectFoo = function(state) { return state.foo }',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
        // VariableDeclarator with non-Identifier id
        {
          code: 'const { selectFoo } = { selectFoo: (state) => state.foo }',
          filename: '/core/foo/selectors/selectFoo.ts',
        },
      ],

      invalid: [
        // dateProvider before state
        {
          code: 'export const selectFoo = (dateProvider, state) => state.foo',
          filename: '/core/foo/selectors/selectFoo.ts',
          errors: [
            {
              messageId: 'stateFirstParam',
              data: { name: 'selectFoo', firstParam: 'dateProvider' },
            },
          ],
        },
        // id before state
        {
          code: 'export const selectFooById = (id, state) => state.foo[id]',
          filename: '/core/foo/selectors/selectFooById.ts',
          errors: [
            {
              messageId: 'stateFirstParam',
              data: { name: 'selectFooById', firstParam: 'id' },
            },
          ],
        },
        // Function declaration with wrong order
        {
          code: 'export function selectFoo(dateProvider, state) { return state.foo }',
          filename: '/core/foo/selectors/selectFoo.ts',
          errors: [
            {
              messageId: 'stateFirstParam',
              data: { name: 'selectFoo', firstParam: 'dateProvider' },
            },
          ],
        },
        // Multiple params, state is third
        {
          code: 'export const selectFoo = (dateProvider, id, state) => state.foo',
          filename: '/core/foo/selectors/selectFoo.ts',
          errors: [
            {
              messageId: 'stateFirstParam',
              data: { name: 'selectFoo', firstParam: 'dateProvider' },
            },
          ],
        },
        // FunctionExpression with wrong order
        {
          code: 'export const selectFoo = function(id, state) { return state.foo }',
          filename: '/core/foo/selectors/selectFoo.ts',
          errors: [
            {
              messageId: 'stateFirstParam',
              data: { name: 'selectFoo', firstParam: 'id' },
            },
          ],
        },
      ],
    })
  })
})
