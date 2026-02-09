/**
 * @fileoverview Tests for slice-matches-folder rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./slice-matches-folder.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('slice-matches-folder', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('slice-matches-folder', rule, {
      valid: [
        // Correct export name matching folder
        {
          code: `export const blocklistSlice = createSlice({})`,
          filename: '/project/core/blocklist/blocklist.slice.ts',
        },
        // Named export
        {
          code: `const authSlice = {}; export { authSlice }`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Multi-word folder name (kebab-case to camelCase)
        {
          code: `export const blockSessionSlice = createSlice({})`,
          filename: '/project/core/block-session/block-session.slice.ts',
        },
        // Non-slice file - should not apply
        {
          code: `export const something = createSlice({})`,
          filename: '/project/core/auth/auth.ts',
        },
        // Not in core - should not apply
        {
          code: `export const wrong = createSlice({})`,
          filename: '/project/infra/auth/auth.slice.ts',
        },
        // node_modules - should skip
        {
          code: `export const wrong = createSlice({})`,
          filename: '/project/node_modules/package/core/auth/auth.slice.ts',
        },
      ],

      invalid: [
        // Wrong export name
        {
          code: `export const wrongSlice = createSlice({})`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'auth.slice.ts',
                expectedName: 'authSlice',
                foundExports: 'wrongSlice',
              },
            },
          ],
        },
        // Missing export entirely
        {
          code: `const authSlice = createSlice({})`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'auth.slice.ts',
                expectedName: 'authSlice',
                foundExports: 'none',
              },
            },
          ],
        },
        // Mismatch between folder and export (using camelCase folder expectation)
        {
          code: `export const sirenSlice = createSlice({})`,
          filename: '/project/core/blocklist/blocklist.slice.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'blocklist.slice.ts',
                expectedName: 'blocklistSlice',
                foundExports: 'sirenSlice',
              },
            },
          ],
        },
      ],
    })
  })
})
