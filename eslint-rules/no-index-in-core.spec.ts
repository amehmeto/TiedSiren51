/**
 * @fileoverview Tests for no-index-in-core rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-index-in-core.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-index-in-core', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-index-in-core', rule, {
      valid: [
        // Non-index file in core - OK
        {
          code: `export const something = {}`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // index.ts in ui - OK
        {
          code: `export * from './Button'`,
          filename: '/project/ui/components/index.ts',
        },
        // index.ts in infra - OK
        {
          code: `export * from './firebase.auth.gateway'`,
          filename: '/project/infra/auth-gateway/index.ts',
        },
        // index.tsx in ui - OK
        {
          code: `export * from './Button'`,
          filename: '/project/ui/components/index.tsx',
        },
        // node_modules - should skip
        {
          code: `export * from './something'`,
          filename: '/project/node_modules/package/core/index.ts',
        },
      ],

      invalid: [
        // index.ts in core - NOT OK
        {
          code: `export * from './auth.slice'`,
          filename: '/project/core/auth/index.ts',
          errors: [
            {
              messageId: 'noIndexInCore',
              data: { filename: 'index.ts' },
            },
          ],
        },
        // index.tsx in core - NOT OK
        {
          code: `export * from './something'`,
          filename: '/project/core/blocklist/index.tsx',
          errors: [
            {
              messageId: 'noIndexInCore',
              data: { filename: 'index.tsx' },
            },
          ],
        },
        // index.ts in core subdirectory - NOT OK
        {
          code: `export * from './selectUser'`,
          filename: '/project/core/auth/selectors/index.ts',
          errors: [
            {
              messageId: 'noIndexInCore',
              data: { filename: 'index.ts' },
            },
          ],
        },
        // index.ts in core/_ports_ - NOT OK
        {
          code: `export * from './auth.gateway'`,
          filename: '/project/core/_ports_/index.ts',
          errors: [
            {
              messageId: 'noIndexInCore',
              data: { filename: 'index.ts' },
            },
          ],
        },
      ],
    })
  })
})
