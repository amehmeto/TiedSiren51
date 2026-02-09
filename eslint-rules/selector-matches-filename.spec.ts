/**
 * @fileoverview Tests for selector-matches-filename rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./selector-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('selector-matches-filename', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('selector-matches-filename', rule, {
      valid: [
        // Correct export name
        {
          code: `export const selectCurrentSession = (state) => state.session`,
          filename:
            '/project/core/block-session/selectors/selectCurrentSession.ts',
        },
        // Function export
        {
          code: `export function selectActiveBlocklist(state) { return state.blocklist }`,
          filename:
            '/project/core/blocklist/selectors/selectActiveBlocklist.ts',
        },
        // Named export
        {
          code: `const selectUserAuth = (state) => state; export { selectUserAuth }`,
          filename: '/project/core/auth/selectors/selectUserAuth.ts',
        },
        // Non-selector file - should not apply
        {
          code: `export const something = () => ({})`,
          filename: '/project/core/auth/selectors/helpers.ts',
        },
        // Not in core - should not apply
        {
          code: `export const wrong = () => ({})`,
          filename: '/project/ui/selectors/selectSomething.ts',
        },
        // View-model file - should not apply
        {
          code: `export const wrong = () => ({})`,
          filename: '/project/core/auth/selectors/auth.view-model.ts',
        },
        // node_modules - should skip
        {
          code: `export const wrong = () => ({})`,
          filename: '/project/node_modules/package/core/selectors/selectFoo.ts',
        },
      ],

      invalid: [
        // Wrong export name
        {
          code: `export const selectWrongName = (state) => state`,
          filename: '/project/core/auth/selectors/selectUserAuth.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'selectUserAuth.ts',
                expectedName: 'selectUserAuth',
                foundExports: 'selectWrongName',
              },
            },
          ],
        },
        // Missing export entirely
        {
          code: `const selectUserAuth = (state) => state.auth`,
          filename: '/project/core/auth/selectors/selectUserAuth.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'selectUserAuth.ts',
                expectedName: 'selectUserAuth',
                foundExports: 'none',
              },
            },
          ],
        },
        // Multiple exports but not the expected one
        {
          code: `
        export const helper = () => {}
        export const selectOther = () => ({})
      `,
          filename: '/project/core/siren/selectors/selectAvailableSirens.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'selectAvailableSirens.ts',
                expectedName: 'selectAvailableSirens',
                foundExports: 'helper, selectOther',
              },
            },
          ],
        },
      ],
    })
  })
})
