/**
 * @fileoverview Tests for schema-matches-filename rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./schema-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('schema-matches-filename', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('schema-matches-filename', rule, {
      valid: [
        // Correct export name
        {
          code: `export const blockSessionSchema = z.object({})`,
          filename: '/project/core/block-session/block-session.schema.ts',
        },
        // Named export
        {
          code: `const authSchema = {}; export { authSchema }`,
          filename: '/project/core/auth/auth.schema.ts',
        },
        // Multi-word kebab-case
        {
          code: `export const blockFormDataSchema = z.object({})`,
          filename: '/project/ui/schemas/block-form-data.schema.ts',
        },
        // Non-schema file - should not apply
        {
          code: `export const something = z.object({})`,
          filename: '/project/core/auth/auth.ts',
        },
        // Test file - should not apply
        {
          code: `export const wrong = z.object({})`,
          filename: '/project/core/auth/auth.schema.test.ts',
        },
        // Spec file - should not apply
        {
          code: `export const wrong = z.object({})`,
          filename: '/project/core/auth/auth.schema.spec.ts',
        },
        // node_modules - should skip
        {
          code: `export const wrong = z.object({})`,
          filename: '/project/node_modules/package/auth.schema.ts',
        },
      ],

      invalid: [
        // Wrong export name
        {
          code: `export const wrongSchema = z.object({})`,
          filename: '/project/core/auth/auth.schema.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'auth.schema.ts',
                expectedName: 'authSchema',
                foundExports: 'wrongSchema',
              },
            },
          ],
        },
        // Missing export entirely
        {
          code: `const authSchema = z.object({})`,
          filename: '/project/core/auth/auth.schema.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'auth.schema.ts',
                expectedName: 'authSchema',
                foundExports: 'none',
              },
            },
          ],
        },
        // Multiple exports but not the expected one
        {
          code: `
        export const helper = z.string()
        export const otherSchema = z.object({})
      `,
          filename: '/project/core/siren/siren.schema.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'siren.schema.ts',
                expectedName: 'sirenSchema',
                foundExports: 'helper, otherSchema',
              },
            },
          ],
        },
      ],
    })
  })
})
