/**
 * @fileoverview Tests for no-date-now rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-date-now.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-date-now', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-date-now', rule, {
      valid: [
        {
          code: `const now = dateProvider.getNowMs()`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        {
          code: `const date = new Date()`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        {
          code: `const timestamp = performance.now()`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Date.now() in infra - OK (adapter implementation)
        {
          code: `const now = Date.now()`,
          filename: '/project/infra/date-provider/real.date-provider.ts',
        },
        // Date.now() in test - OK (excluded)
        {
          code: `const now = Date.now()`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Date.now() in fixture - OK (excluded)
        {
          code: `const now = Date.now()`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // Date.now() outside core/ui - OK (not scoped)
        {
          code: `const now = Date.now()`,
          filename: '/project/scripts/seed.ts',
        },
      ],

      invalid: [
        {
          code: `const now = Date.now()`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [{ messageId: 'noDateNow' }],
        },
        {
          code: `setNow(Date.now())`,
          filename: '/project/ui/screens/Home/Home.tsx',
          errors: [{ messageId: 'noDateNow' }],
        },
        {
          code: `const elapsed = Date.now() - startTime`,
          filename: '/project/core/timer/timer.slice.ts',
          errors: [{ messageId: 'noDateNow' }],
        },
      ],
    })
  })
})
