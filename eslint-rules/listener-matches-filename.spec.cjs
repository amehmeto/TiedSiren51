/**
 * @fileoverview Tests for listener-matches-filename rule
 */

const { RuleTester } = require('eslint')
const rule = require('./listener-matches-filename.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('listener-matches-filename', rule, {
  valid: [
    // Correct export name
    {
      code: `export const onUserLoggedInListener = () => {}`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.ts',
    },
    // Function export
    {
      code: `export function onSessionStartedListener() { return {} }`,
      filename: '/project/core/block-session/listeners/on-session-started.listener.ts',
    },
    // Named export via const
    {
      code: `const onBlocklistUpdatedListener = () => {}; export { onBlocklistUpdatedListener }`,
      filename: '/project/core/blocklist/listeners/on-blocklist-updated.listener.ts',
    },
    // Multi-word kebab-case
    {
      code: `export const onStrictModeEnabledListener = () => {}`,
      filename: '/project/core/strict-mode/listeners/on-strict-mode-enabled.listener.ts',
    },
    // Non-listener file - should not apply
    {
      code: `export const something = () => {}`,
      filename: '/project/core/auth/listeners/helpers.ts',
    },
    // Not in listeners folder - should not apply
    {
      code: `export const wrong = () => {}`,
      filename: '/project/core/auth/usecases/on-something.listener.ts',
    },
    // Test file - should not apply
    {
      code: `export const wrong = () => {}`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.test.ts',
    },
    // node_modules - should skip
    {
      code: `export const wrong = () => {}`,
      filename: '/project/node_modules/package/listeners/on-foo.listener.ts',
    },
  ],

  invalid: [
    // Wrong export name
    {
      code: `export const wrongListener = () => {}`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'on-user-logged-in.listener.ts',
            expectedName: 'onUserLoggedInListener',
            foundExports: 'wrongListener',
          },
        },
      ],
    },
    // Missing export entirely
    {
      code: `const onUserLoggedInListener = () => {}`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'on-user-logged-in.listener.ts',
            expectedName: 'onUserLoggedInListener',
            foundExports: 'none',
          },
        },
      ],
    },
    // Multiple exports but not the expected one
    {
      code: `
        export const helper = () => {}
        export const onOtherListener = () => {}
      `,
      filename: '/project/core/siren/listeners/on-siren-added.listener.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'on-siren-added.listener.ts',
            expectedName: 'onSirenAddedListener',
            foundExports: 'helper, onOtherListener',
          },
        },
      ],
    },
  ],
})
