/**
 * @fileoverview Tests for usecase-matches-filename rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./usecase-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('usecase-matches-filename', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('usecase-matches-filename', rule, {
      valid: [
        // Correct export name
        {
          code: `export const startSession = () => {}`,
          filename:
            '/project/core/block-session/usecases/start-session.usecase.ts',
        },
        // Function export
        {
          code: `export function loadBlocklists() { return {} }`,
          filename:
            '/project/core/blocklist/usecases/load-blocklists.usecase.ts',
        },
        // Named export
        {
          code: `const createSiren = () => {}; export { createSiren }`,
          filename: '/project/core/siren/usecases/create-siren.usecase.ts',
        },
        // Multi-word kebab-case
        {
          code: `export const validateBlocklistForm = () => {}`,
          filename:
            '/project/core/blocklist/usecases/validate-blocklist-form.usecase.ts',
        },
        // Non-usecase file - should not apply
        {
          code: `export const something = () => {}`,
          filename: '/project/core/blocklist/blocklist.slice.ts',
        },
        // Not in core - should not apply
        {
          code: `export const wrong = () => {}`,
          filename: '/project/infra/usecases/something.usecase.ts',
        },
        // node_modules - should skip
        {
          code: `export const wrong = () => {}`,
          filename:
            '/project/node_modules/package/core/usecases/file.usecase.ts',
        },
        // Non-usecase .ts file in usecases folder - should not apply
        {
          code: `export const someFixture = {}`,
          filename: '/project/core/auth/usecases/auth.fixture.ts',
        },
      ],

      invalid: [
        // Wrong export name
        {
          code: `export const wrongName = () => {}`,
          filename: '/project/core/auth/usecases/login.usecase.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'login.usecase.ts',
                expectedName: 'login',
                foundExports: 'wrongName',
              },
            },
          ],
        },
        // Missing export entirely
        {
          code: `const login = () => {}`,
          filename: '/project/core/auth/usecases/login.usecase.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'login.usecase.ts',
                expectedName: 'login',
                foundExports: 'none',
              },
            },
          ],
        },
        // Multiple exports but not the expected one
        {
          code: `
        export const helper = () => {}
        export const otherUsecase = () => {}
      `,
          filename: '/project/core/siren/usecases/add-siren.usecase.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'add-siren.usecase.ts',
                expectedName: 'addSiren',
                foundExports: 'helper, otherUsecase',
              },
            },
          ],
        },
      ],
    })
  })
})
