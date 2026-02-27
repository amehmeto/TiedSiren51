/**
 * @fileoverview Tests for naming-convention-boolean-prefix rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./naming-convention-boolean-prefix.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  parser: require.resolve('@typescript-eslint/parser'),
})

describe('naming-convention-boolean-prefix', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('naming-convention-boolean-prefix', rule, {
      valid: [
        // Boolean with is-prefix - OK
        {
          code: `const isActive: boolean = true`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // Boolean with has-prefix - OK
        {
          code: `const hasPermission: boolean = false`,
          filename: '/project/ui/components/Auth.ts',
        },
        // Boolean with should-prefix - OK
        {
          code: `const shouldRefresh: boolean = true`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // Boolean with can-prefix - OK
        {
          code: `const canEdit: boolean = false`,
          filename: '/project/ui/screens/Editor.ts',
        },
        // Boolean with did-prefix - OK
        {
          code: `const didLoad: boolean = true`,
          filename: '/project/ui/screens/Home.ts',
        },
        // Boolean with will-prefix - OK
        {
          code: `const willUpdate: boolean = true`,
          filename: '/project/ui/screens/Home.ts',
        },
        // Boolean with was-prefix - OK
        {
          code: `const wasDeleted: boolean = false`,
          filename: '/project/ui/screens/Home.ts',
        },
        // Non-boolean variable without prefix - OK
        {
          code: `const name: string = 'test'`,
          filename: '/project/ui/components/User.ts',
        },
        // Interface without I-prefix - OK
        {
          code: `interface User { name: string }`,
          filename: '/project/core/auth/user.ts',
        },
        // Underscore-prefixed boolean - OK (skipped)
        {
          code: `const _internal: boolean = true`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // Non-TS file - OK (rule is skipped)
        {
          code: `const active: boolean = true`,
          filename: '/project/config.js',
        },
      ],

      invalid: [
        // Boolean without prefix - NOT OK
        {
          code: `const active: boolean = true`,
          filename: '/project/ui/components/Toggle.ts',
          errors: [
            {
              messageId: 'booleanPrefix',
              data: {
                name: 'active',
                kind: 'variable',
                prefixes: 'is, has, should, can, did, will, was',
              },
            },
          ],
        },
        // Interface with I-prefix - NOT OK
        {
          code: `interface IUser { name: string }`,
          filename: '/project/core/auth/user.ts',
          errors: [
            {
              messageId: 'noIPrefix',
              data: { name: 'IUser', suggestion: 'User' },
            },
          ],
        },
        // Boolean class property without prefix - NOT OK
        {
          code: `
class Foo {
  enabled: boolean = false
}
`,
          filename: '/project/ui/components/Toggle.ts',
          errors: [
            {
              messageId: 'booleanPrefix',
              data: {
                name: 'enabled',
                kind: 'class property',
                prefixes: 'is, has, should, can, did, will, was',
              },
            },
          ],
        },
        // Boolean parameter without prefix - NOT OK
        {
          code: `function toggle(active: boolean) {}`,
          filename: '/project/ui/components/Toggle.ts',
          errors: [
            {
              messageId: 'booleanPrefix',
              data: {
                name: 'active',
                kind: 'parameter',
                prefixes: 'is, has, should, can, did, will, was',
              },
            },
          ],
        },
        // Interface with I-prefix (IProps) - NOT OK
        {
          code: `interface IProps { value: number }`,
          filename: '/project/ui/components/Button.tsx',
          errors: [
            {
              messageId: 'noIPrefix',
              data: { name: 'IProps', suggestion: 'Props' },
            },
          ],
        },
      ],
    })
  })
})
