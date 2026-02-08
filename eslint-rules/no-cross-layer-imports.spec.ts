/**
 * @fileoverview Tests for no-cross-layer-imports rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-cross-layer-imports.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-cross-layer-imports', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-cross-layer-imports', rule, {
      valid: [
        // Core importing from core - OK
        {
          code: `import { something } from '@core/auth'`,
          filename: '/project/core/blocklist/blocklist.slice.ts',
        },
        // UI importing from core - OK
        {
          code: `import { selectUser } from '@core/auth/selectors/selectUser'`,
          filename: '/project/ui/screens/Home/HomeScreen.tsx',
        },
        // UI importing from infra - OK
        {
          code: `import { FirebaseAuthGateway } from '@infra/auth-gateway'`,
          filename: '/project/ui/screens/Home/HomeScreen.tsx',
        },
        // Infra importing from core - OK
        {
          code: `import { AuthUser } from '@core/auth/auth-user'`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
        },
        // Test file - should not apply
        {
          code: `import { FirebaseAuthGateway } from '@infra/auth-gateway'`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Fixture file - should not apply
        {
          code: `import { FirebaseAuthGateway } from '@infra/auth-gateway'`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // _tests_ directory - should not apply
        {
          code: `import { FirebaseAuthGateway } from '@infra/auth-gateway'`,
          filename: '/project/core/_tests_/utils.ts',
        },
        // node_modules - should skip
        {
          code: `import { something } from '@infra/auth'`,
          filename: '/project/node_modules/package/core/file.ts',
        },
        // External package import - OK
        {
          code: `import { createSlice } from '@reduxjs/toolkit'`,
          filename: '/project/core/auth/auth.slice.ts',
        },
      ],

      invalid: [
        // Core importing from infra - NOT OK
        {
          code: `import { FirebaseAuthGateway } from '@infra/auth-gateway'`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'forbiddenImport',
              data: { fromLayer: 'core', toLayer: 'infra' },
            },
          ],
        },
        // Core importing from ui - NOT OK
        {
          code: `import { HomeScreen } from '@ui/screens/Home'`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'forbiddenImport',
              data: { fromLayer: 'core', toLayer: 'ui' },
            },
          ],
        },
        // Infra importing from ui - NOT OK
        {
          code: `import { Button } from '@ui/components/Button'`,
          filename: '/project/infra/auth-gateway/firebase.auth.gateway.ts',
          errors: [
            {
              messageId: 'forbiddenImport',
              data: { fromLayer: 'infra', toLayer: 'ui' },
            },
          ],
        },
        // Relative import crossing boundaries - NOT OK
        {
          code: `import { something } from '../../infra/auth-gateway'`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'forbiddenImport',
              data: { fromLayer: 'core', toLayer: 'infra' },
            },
          ],
        },
        // Note: Dynamic imports are not currently supported by this rule
        // (the rule uses CallExpression[callee.type="Import"] but ESLint parses
        // dynamic imports as ImportExpression nodes)
      ],
    })
  })
})
