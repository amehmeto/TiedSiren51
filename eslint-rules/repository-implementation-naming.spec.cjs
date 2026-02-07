/**
 * @fileoverview Tests for repository-implementation-naming rule
 */

const { RuleTester } = require('eslint')
const rule = require('./repository-implementation-naming.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('repository-implementation-naming', rule, {
  valid: [
    // Correct class export
    {
      code: `export class PrismaBlockSessionRepository {}`,
      filename: '/project/infra/block-session-repository/prisma.block-session.repository.ts',
    },
    // Named export via class
    {
      code: `class InMemoryBlocklistRepository {}; export { InMemoryBlocklistRepository }`,
      filename: '/project/infra/blocklist-repository/in-memory.blocklist.repository.ts',
    },
    // Multi-word prefix
    {
      code: `export class PowersyncBlockSessionRepository {}`,
      filename: '/project/infra/block-session-repository/powersync.block-session.repository.ts',
    },
    // Non-repository file - should not apply
    {
      code: `export class SomeClass {}`,
      filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
    },
    // Not in infra - should not apply
    {
      code: `export class Wrong {}`,
      filename: '/project/core/auth/prisma.auth.repository.ts',
    },
    // Test file - should not apply
    {
      code: `export class Wrong {}`,
      filename: '/project/infra/auth-repository/prisma.auth.repository.test.ts',
    },
    // Spec file - should not apply
    {
      code: `export class Wrong {}`,
      filename: '/project/infra/auth-repository/prisma.auth.repository.spec.ts',
    },
    // node_modules - should skip
    {
      code: `export class Wrong {}`,
      filename: '/project/node_modules/package/infra/prisma.auth.repository.ts',
    },
  ],

  invalid: [
    // Wrong class name
    {
      code: `export class WrongRepository {}`,
      filename: '/project/infra/auth-repository/prisma.auth.repository.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'prisma.auth.repository.ts',
            expectedName: 'PrismaAuthRepository',
            foundExports: 'WrongRepository',
          },
        },
      ],
    },
    // Missing export entirely
    {
      code: `class PrismaAuthRepository {}`,
      filename: '/project/infra/auth-repository/prisma.auth.repository.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'prisma.auth.repository.ts',
            expectedName: 'PrismaAuthRepository',
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
      filename: '/project/infra/siren-repository/pouchdb.siren.repository.ts',
      errors: [
        {
          messageId: 'missingExport',
          data: {
            filename: 'pouchdb.siren.repository.ts',
            expectedName: 'PouchdbSirenRepository',
            foundExports: 'Helper, OtherRepository',
          },
        },
      ],
    },
  ],
})
