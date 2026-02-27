/**
 * @fileoverview Tests for core-no-restricted-imports rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./core-no-restricted-imports.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('core-no-restricted-imports', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('core-no-restricted-imports', rule, {
      valid: [
        // Importing from a provider instead of uuid - OK
        {
          code: `import { v4 } from './uuid-provider'`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // uuid import outside core - OK (not scoped)
        {
          code: `import { v4 } from 'uuid'`,
          filename: '/project/infra/uuid-provider/real-uuid-provider.ts',
        },
        // uuid import in test file - OK (excluded)
        {
          code: `import { v4 } from 'uuid'`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // uuid import in fixture file - OK (excluded)
        {
          code: `import { v4 } from 'uuid'`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // uuid import in ports - OK (excluded)
        {
          code: `import { v4 } from 'uuid'`,
          filename: '/project/core/_ports_/uuid-provider.ts',
        },
        // uuid import in builder file - OK (excluded)
        {
          code: `import { v4 } from 'uuid'`,
          filename: '/project/core/auth/auth.builder.ts',
        },
        // Non-restricted import in core - OK
        {
          code: `import { createSlice } from '@reduxjs/toolkit'`,
          filename: '/project/core/auth/auth.slice.ts',
        },
      ],

      invalid: [
        // uuid import in core production - NOT OK
        {
          code: `import { v4 } from 'uuid'`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use UuidProvider dependency instead of uuid in core.',
              },
            },
          ],
        },
        // react-native-uuid import in core production - NOT OK
        {
          code: `import uuid from 'react-native-uuid'`,
          filename: '/project/core/siren/siren.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use UuidProvider dependency instead of react-native-uuid in core.',
              },
            },
          ],
        },
        // crypto import in core production - NOT OK
        {
          code: `import { randomBytes } from 'crypto'`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
              },
            },
          ],
        },
        // faker import in core production - NOT OK
        {
          code: `import { faker } from '@faker-js/faker'`,
          filename: '/project/core/blocklist/blocklist.slice.ts',
          errors: [
            {
              messageId: 'restricted',
              data: {
                message:
                  'Non-deterministic: Use data builders with injected dependencies instead of faker in core.',
              },
            },
          ],
        },
      ],
    })
  })
})
