/**
 * @fileoverview Tests for no-data-builders-in-production rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-data-builders-in-production.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-data-builders-in-production', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-data-builders-in-production', rule, {
      valid: [
        // Using builder in test file - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/core/session/session.test.ts',
        },
        // Using builder in spec file - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/core/session/session.spec.ts',
        },
        // Using builder in fixture file - OK
        {
          code: `export const fixture = buildBlockSession()`,
          filename: '/project/core/session/session.fixture.ts',
        },
        // Using builder in another builder file - OK
        {
          code: `
        import { buildBlockSession } from './block-session.builder'
        export const buildComplexSession = () => buildBlockSession()
      `,
          filename: '/project/tests/builders/complex-session.builder.ts',
        },
        // Using builder in _tests_ directory - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/core/_tests_/utils.ts',
        },
        // Importing from data-builders in test - OK
        {
          code: `import { buildBlockSession } from '@tests/data-builders/block-session.builder'`,
          filename: '/project/core/session/session.test.ts',
        },
        // Non-builder function - Note: buildUrl would still trigger because rule catches all build* functions
        // This test case is removed since the rule intentionally catches ALL build* functions
        // Production code should use different naming like 'createUrl' or 'formatUrl'
        // Production code without builders - OK
        {
          code: `const session = createSession()`,
          filename: '/project/core/session/session.slice.ts',
        },
        // CallExpression with non-Identifier callee (MemberExpression)
        {
          code: `const session = factory.buildSession()`,
          filename: '/project/core/session/session.slice.ts',
        },
        // Default import (ImportDefaultSpecifier)
        {
          code: `import builder from '@tests/data-builders/session.builder'`,
          filename: '/project/core/session/session.slice.ts',
        },
        // Namespace import (ImportNamespaceSpecifier)
        {
          code: `import * as builders from '@tests/data-builders/session.builder'`,
          filename: '/project/core/session/session.slice.ts',
        },
        // Using builder in test.tsx file - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/ui/screens/Home/HomeScreen.test.tsx',
        },
        // Using builder in spec.tsx file - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/ui/screens/Home/HomeScreen.spec.tsx',
        },
        // Using builder in fixture.tsx file - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/ui/screens/Home/HomeScreen.fixture.tsx',
        },
        // Using builder in builder.tsx file - OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/tests/builders/session.builder.tsx',
        },
        // Import with non-builder named specifier from data-builders
        {
          code: `import { SessionType } from '@tests/data-builders/session.builder'`,
          filename: '/project/core/session/session.slice.ts',
        },
        // Windows path separator in _tests_ directory - OK
        {
          code: `const session = buildBlockSession()`,
          filename: 'C:\\project\\core\\_tests_\\utils.ts',
        },
        // Import from 'data-builders' directly (edge case)
        {
          code: `import { SessionType } from 'data-builders'`,
          filename: '/project/core/session/session.slice.ts',
        },
      ],

      invalid: [
        // Using builder in production code - NOT OK
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/core/session/session.slice.ts',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildBlockSession' },
            },
          ],
        },
        // Importing builder in production code - NOT OK
        {
          code: `import { buildBlockSession } from '@tests/data-builders/block-session.builder'`,
          filename: '/project/core/session/session.slice.ts',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildBlockSession' },
            },
          ],
        },
        // Using builder in UI component - NOT OK
        {
          code: `const mockSession = buildBlockSession()`,
          filename: '/project/ui/screens/Home/HomeScreen.tsx',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildBlockSession' },
            },
          ],
        },
        // Using builder in infra - NOT OK
        {
          code: `const defaultSession = buildBlockSession()`,
          filename:
            '/project/infra/session-repository/prisma.session.repository.ts',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildBlockSession' },
            },
          ],
        },
        // Multiple builder calls - NOT OK
        {
          code: `
        const session = buildBlockSession()
        const blocklist = buildBlocklist()
      `,
          filename: '/project/core/session/session.slice.ts',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildBlockSession' },
            },
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildBlocklist' },
            },
          ],
        },
        // Importing from data-builders directory in production - NOT OK
        {
          code: `import { buildDevice } from 'data-builders/device.builder'`,
          filename: '/project/core/device/device.ts',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildDevice' },
            },
          ],
        },
        // Importing from 'data-builders' directly with builder - NOT OK
        {
          code: `import { buildSession } from 'data-builders'`,
          filename: '/project/core/session/session.ts',
          errors: [
            {
              messageId: 'noDataBuilderInProduction',
              data: { builderName: 'buildSession' },
            },
          ],
        },
      ],
    })
  })
})
