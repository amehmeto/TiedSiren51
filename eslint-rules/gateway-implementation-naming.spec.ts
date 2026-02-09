/**
 * @fileoverview Tests for gateway-implementation-naming rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./gateway-implementation-naming.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('gateway-implementation-naming', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('gateway-implementation-naming', rule, {
      valid: [
        // Correct class export
        {
          code: `export class FirebaseAuthGateway {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Named export via class
        {
          code: `class ExpoNotificationGateway {}; export { ExpoNotificationGateway }`,
          filename:
            '/project/infra/notification-gateway/expo.notification.gateway.ts',
        },
        // Multi-word prefix and domain
        {
          code: `export class InMemoryBlockSessionGateway {}`,
          filename:
            '/project/infra/block-session-gateway/in-memory.block-session.gateway.ts',
        },
        // Non-gateway file - should not apply
        {
          code: `export class SomeClass {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.repository.ts',
        },
        // Not in infra - should not apply
        {
          code: `export class Wrong {}`,
          filename: '/project/core/auth/firebase.auth.gateway.ts',
        },
        // Test file - should not apply
        {
          code: `export class Wrong {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.test.ts',
        },
        // Spec file - should not apply
        {
          code: `export class Wrong {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.spec.ts',
        },
        // node_modules - should skip
        {
          code: `export class Wrong {}`,
          filename:
            '/project/node_modules/package/infra/firebase.auth.gateway.ts',
        },
      ],

      invalid: [
        // Wrong class name
        {
          code: `export class WrongGateway {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'firebase.auth.gateway.ts',
                expectedName: 'FirebaseAuthGateway',
                foundExports: 'WrongGateway',
              },
            },
          ],
        },
        // Missing export entirely
        {
          code: `class FirebaseAuthGateway {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'firebase.auth.gateway.ts',
                expectedName: 'FirebaseAuthGateway',
                foundExports: 'none',
              },
            },
          ],
        },
        // Multiple exports but not the expected one
        {
          code: `
        export class Helper {}
        export class OtherGateway {}
      `,
          filename: '/project/infra/auth-gateway/expo.auth.gateway.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'expo.auth.gateway.ts',
                expectedName: 'ExpoAuthGateway',
                foundExports: 'Helper, OtherGateway',
              },
            },
          ],
        },
      ],
    })
  })
})
