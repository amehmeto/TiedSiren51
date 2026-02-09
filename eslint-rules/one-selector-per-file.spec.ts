/**
 * @fileoverview Tests for one-selector-per-file rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./one-selector-per-file.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('one-selector-per-file', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('one-selector-per-file', rule, {
      valid: [
        // Single selector export
        {
          code: `export const selectUser = (state) => state.user`,
          filename: '/project/core/auth/selectors/selectUser.ts',
        },
        // Single selector function
        {
          code: `export function selectBlocklist(state) { return state.blocklist }`,
          filename: '/project/core/blocklist/selectors/selectBlocklist.ts',
        },
        // Single named export
        {
          code: `const selectSession = (state) => state.session; export { selectSession }`,
          filename: '/project/core/session/selectors/selectSession.ts',
        },
        // Non-selector exports are allowed
        {
          code: `
        export const selectUser = (state) => state.user
        export const helper = () => {}
        export const utils = {}
      `,
          filename: '/project/core/auth/selectors/selectUser.ts',
        },
        // Not in selectors folder - should not apply
        {
          code: `
        export const selectOne = () => {}
        export const selectTwo = () => {}
      `,
          filename: '/project/core/auth/utils.ts',
        },
      ],

      invalid: [
        // Two selectors - NOT OK
        {
          code: `
        export const selectUser = (state) => state.user
        export const selectAuth = (state) => state.auth
      `,
          filename: '/project/core/auth/selectors/selectUser.ts',
          errors: [
            {
              messageId: 'multipleSelectors',
              data: {
                count: 2,
                selectors: 'selectUser, selectAuth',
              },
            },
          ],
        },
        // Three selectors - NOT OK
        {
          code: `
        export const selectA = () => {}
        export const selectB = () => {}
        export const selectC = () => {}
      `,
          filename: '/project/core/auth/selectors/file.ts',
          errors: [
            {
              messageId: 'multipleSelectors',
              data: {
                count: 3,
                selectors: 'selectA, selectB, selectC',
              },
            },
          ],
        },
        // Mixed export styles - NOT OK
        {
          code: `
        const selectTwo = (state) => state
        export function selectOne(state) { return state }
        export { selectTwo }
      `,
          filename: '/project/core/auth/selectors/file.ts',
          errors: [
            {
              messageId: 'multipleSelectors',
              data: {
                count: 2,
                selectors: 'selectOne, selectTwo',
              },
            },
          ],
        },
      ],
    })
  })
})
