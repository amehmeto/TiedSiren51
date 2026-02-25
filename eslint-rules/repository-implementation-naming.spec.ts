/**
 * @fileoverview Tests for repository-implementation-naming rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./repository-implementation-naming.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('repository-implementation-naming', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('repository-implementation-naming', rule, {
      valid: [
        // Correct class export
        {
          code: `export class PowersyncBlockSessionRepository {}`,
          filename:
            '/project/infra/block-session-repository/powersync.block-session.repository.ts',
        },
        // Named export via class
        {
          code: `class InMemoryBlocklistRepository {}; export { InMemoryBlocklistRepository }`,
          filename:
            '/project/infra/blocklist-repository/in-memory.blocklist.repository.ts',
        },
        // Multi-word prefix
        {
          code: `export class FakeDataSirensRepository {}`,
          filename:
            '/project/infra/siren-repository/fake-data.sirens.repository.ts',
        },
        // Non-repository file - should not apply
        {
          code: `export class SomeClass {}`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Not in infra - should not apply
        {
          code: `export class Wrong {}`,
          filename: '/project/core/auth/powersync.auth.repository.ts',
        },
        // Test file - should not apply
        {
          code: `export class Wrong {}`,
          filename:
            '/project/infra/auth-repository/powersync.auth.repository.test.ts',
        },
        // Spec file - should not apply
        {
          code: `export class Wrong {}`,
          filename:
            '/project/infra/auth-repository/powersync.auth.repository.spec.ts',
        },
        // node_modules - should skip
        {
          code: `export class Wrong {}`,
          filename:
            '/project/node_modules/package/infra/powersync.auth.repository.ts',
        },
      ],

      invalid: [
        // Wrong class name
        {
          code: `export class WrongRepository {}`,
          filename:
            '/project/infra/auth-repository/powersync.auth.repository.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'powersync.auth.repository.ts',
                expectedName: 'PowersyncAuthRepository',
                foundExports: 'WrongRepository',
              },
            },
          ],
        },
        // Missing export entirely
        {
          code: `class PowersyncAuthRepository {}`,
          filename:
            '/project/infra/auth-repository/powersync.auth.repository.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'powersync.auth.repository.ts',
                expectedName: 'PowersyncAuthRepository',
                foundExports: 'none',
              },
            },
          ],
        },
        // Multiple exports but not the expected one
        {
          code: `
        export class Helper {}
        export class OtherRepository {}
      `,
          filename:
            '/project/infra/siren-repository/firebase.siren.repository.ts',
          errors: [
            {
              messageId: 'missingExport',
              data: {
                filename: 'firebase.siren.repository.ts',
                expectedName: 'FirebaseSirenRepository',
                foundExports: 'Helper, OtherRepository',
              },
            },
          ],
        },
      ],
    })
  })
})
