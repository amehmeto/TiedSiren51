/**
 * @fileoverview Tests for builder-matches-filename rule
 */

const { RuleTester } = require('eslint')
const rule = require('./builder-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('builder-matches-filename', rule, {
  valid: [
    // Correct export name for kebab-case filename
    {
      code: `export const buildBlockSession = () => ({})`,
      filename: '/project/tests/builders/block-session.builder.ts',
    },
    // Correct function export
    {
      code: `export function buildBlockSession() { return {} }`,
      filename: '/project/tests/builders/block-session.builder.ts',
    },
    // Default export (alternative pattern)
    {
      code: `const buildBlockSession = () => ({}); export { buildBlockSession }`,
      filename: '/project/tests/builders/block-session.builder.ts',
    },
    // Multi-word kebab-case
    {
      code: `export const buildBlocklistFormData = () => ({})`,
      filename: '/project/tests/builders/blocklist-form-data.builder.ts',
    },
    // Non-builder file - should not apply
    {
      code: `export const something = () => ({})`,
      filename: '/project/src/utils.ts',
    },
    // node_modules - should skip
    {
      code: `export const wrong = () => ({})`,
      filename: '/project/node_modules/package/file.builder.ts',
    },
  ],

  invalid: [
    // Wrong export name
    {
      code: `export const buildWrongName = () => ({})`,
      filename: '/project/tests/builders/block-session.builder.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'block-session.builder.ts',
            expectedName: 'buildBlockSession',
            foundExports: 'buildWrongName',
          },
        },
      ],
    },
    // Missing export entirely
    {
      code: `const buildBlockSession = () => ({})`,
      filename: '/project/tests/builders/block-session.builder.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'block-session.builder.ts',
            expectedName: 'buildBlockSession',
            foundExports: 'none',
          },
        },
      ],
    },
    // Multiple exports but not the expected one
    {
      code: `
        export const helper = () => {}
        export const buildOther = () => ({})
      `,
      filename: '/project/tests/builders/siren.builder.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'siren.builder.ts',
            expectedName: 'buildSiren',
            foundExports: 'helper, buildOther',
          },
        },
      ],
    },
  ],
})
