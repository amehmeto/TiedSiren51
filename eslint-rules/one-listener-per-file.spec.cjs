/**
 * @fileoverview Tests for one-listener-per-file rule
 */

const { RuleTester } = require('eslint')
const rule = require('./one-listener-per-file.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('one-listener-per-file', rule, {
  valid: [
    // Single listener export
    {
      code: `export const onUserLoggedInListener = () => {}`,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.ts',
    },
    // Single listener function
    {
      code: `export function onSessionStartedListener() { return {} }`,
      filename: '/project/core/session/listeners/on-session-started.listener.ts',
    },
    // Single named export
    {
      code: `const onBlocklistUpdatedListener = () => {}; export { onBlocklistUpdatedListener }`,
      filename: '/project/core/blocklist/listeners/on-blocklist-updated.listener.ts',
    },
    // Non-listener exports are allowed
    {
      code: `
        export const onUserLoggedInListener = () => {}
        export const helper = () => {}
        export const utils = {}
      `,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.ts',
    },
    // Not a .listener.ts file - should not apply
    {
      code: `
        export const onOneListener = () => {}
        export const onTwoListener = () => {}
      `,
      filename: '/project/core/auth/listeners/helpers.ts',
    },
    // Test file - should not apply
    {
      code: `
        export const onOneListener = () => {}
        export const onTwoListener = () => {}
      `,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.test.ts',
    },
    // Spec file - should not apply
    {
      code: `
        export const onOneListener = () => {}
        export const onTwoListener = () => {}
      `,
      filename: '/project/core/auth/listeners/on-user-logged-in.listener.spec.ts',
    },
    // node_modules - should skip
    {
      code: `
        export const onOneListener = () => {}
        export const onTwoListener = () => {}
      `,
      filename: '/project/node_modules/package/listeners/on-foo.listener.ts',
    },
  ],

  invalid: [
    // Two listeners - NOT OK
    {
      code: `
        export const onUserLoggedInListener = () => {}
        export const onUserLoggedOutListener = () => {}
      `,
      filename: '/project/core/auth/listeners/on-user.listener.ts',
      errors: [
        {
          messageId: 'multipleListeners',
          data: {
            filename: 'on-user.listener.ts',
            count: 2,
            listeners: 'onUserLoggedInListener, onUserLoggedOutListener',
          },
        },
      ],
    },
    // Three listeners - NOT OK
    {
      code: `
        export const onAListener = () => {}
        export const onBListener = () => {}
        export const onCListener = () => {}
      `,
      filename: '/project/core/auth/listeners/on-multi.listener.ts',
      errors: [
        {
          messageId: 'multipleListeners',
          data: {
            filename: 'on-multi.listener.ts',
            count: 3,
            listeners: 'onAListener, onBListener, onCListener',
          },
        },
      ],
    },
    // Mixed export styles - NOT OK
    {
      code: `
        const onStopListener = () => {}
        export function onStartListener() { return {} }
        export { onStopListener }
      `,
      filename: '/project/core/session/listeners/on-session.listener.ts',
      errors: [
        {
          messageId: 'multipleListeners',
          data: {
            filename: 'on-session.listener.ts',
            count: 2,
            listeners: 'onStartListener, onStopListener',
          },
        },
      ],
    },
  ],
})
