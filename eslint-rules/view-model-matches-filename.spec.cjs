/**
 * @fileoverview Tests for view-model-matches-filename rule
 */

const { RuleTester } = require('eslint')
const rule = require('./view-model-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('view-model-matches-filename', rule, {
  valid: [
    // Correct export name
    {
      code: `export const selectHomeViewModel = () => ({})`,
      filename: '/project/ui/screens/Home/home.view-model.ts',
    },
    // Function export
    {
      code: `export function selectBlocklistViewModel() { return {} }`,
      filename: '/project/ui/screens/Blocklist/blocklist.view-model.ts',
    },
    // Named export
    {
      code: `const selectSessionViewModel = () => ({}); export { selectSessionViewModel }`,
      filename: '/project/ui/screens/Session/session.view-model.ts',
    },
    // Multi-word kebab-case
    {
      code: `export const selectStrictModeViewModel = () => ({})`,
      filename: '/project/ui/screens/StrictMode/strict-mode.view-model.ts',
    },
    // Non-view-model file - should not apply
    {
      code: `export const something = () => ({})`,
      filename: '/project/ui/screens/Home/HomeScreen.tsx',
    },
    // Test file - should not apply
    {
      code: `export const wrong = () => ({})`,
      filename: '/project/ui/screens/Home/home.view-model.test.ts',
    },
    // node_modules - should skip
    {
      code: `export const wrong = () => ({})`,
      filename: '/project/node_modules/package/home.view-model.ts',
    },
  ],

  invalid: [
    // Wrong export name
    {
      code: `export const selectWrongName = () => ({})`,
      filename: '/project/ui/screens/Home/home.view-model.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'home.view-model.ts',
            expectedName: 'selectHomeViewModel',
            foundExports: 'selectWrongName',
          },
        },
      ],
    },
    // Missing export entirely
    {
      code: `const selectHomeViewModel = () => ({})`,
      filename: '/project/ui/screens/Home/home.view-model.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'home.view-model.ts',
            expectedName: 'selectHomeViewModel',
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
      filename: '/project/ui/screens/Auth/auth.view-model.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'auth.view-model.ts',
            expectedName: 'selectAuthViewModel',
            foundExports: 'helper, selectOther',
          },
        },
      ],
    },
  ],
})
