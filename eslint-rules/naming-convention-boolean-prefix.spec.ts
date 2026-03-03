/**
 * @fileoverview Tests for naming-convention-boolean-prefix rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './naming-convention-boolean-prefix.js'

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
        // Computed class property - OK (skipped)
        {
          code: `
class Foo {
  ['enabled']: boolean = false
}
`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // Class property with correct prefix - OK
        {
          code: `
class Foo {
  isEnabled: boolean = false
}
`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // Underscore-prefixed class property with correct prefix after underscore - OK
        {
          code: `
class Foo {
  _isActive: boolean = true
}
`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // Non-boolean class property - OK
        {
          code: `
class Foo {
  name: string = 'test'
}
`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // TSPropertySignature with computed key - OK (skipped)
        {
          code: `type Flags = { [key: string]: boolean }`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // TSPropertySignature non-boolean - OK
        {
          code: `type Config = { name: string }`,
          filename: '/project/core/auth/auth.slice.ts',
        },
        // TSPropertySignature outside core - OK (not enforced)
        {
          code: `type Flags = { active: boolean }`,
          filename: '/project/ui/screens/Home.ts',
        },
        // TSPropertySignature in test file - OK (excluded)
        {
          code: `type Flags = { active: boolean }`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Arrow function param with boolean prefix - OK
        {
          code: `const fn = (isActive: boolean) => {}`,
          filename: '/project/ui/components/Toggle.ts',
        },
        // Destructured variable - OK (id is not Identifier, skipped)
        {
          code: `const { active }: { active: boolean } = obj`,
          filename: '/project/ui/components/Toggle.ts',
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
        // Underscore-prefixed class property without prefix after underscore - NOT OK
        {
          code: `
class Foo {
  _active: boolean = true
}
`,
          filename: '/project/ui/components/Toggle.ts',
          errors: [
            {
              messageId: 'booleanPrefix',
              data: {
                name: 'active',
                kind: 'class property',
                prefixes: 'is, has, should, can, did, will, was',
              },
            },
          ],
        },
        // Boolean type property in core production code without prefix - NOT OK
        {
          code: `type Flags = { active: boolean }`,
          filename: '/project/core/auth/auth.slice.ts',
          errors: [
            {
              messageId: 'booleanPrefix',
              data: {
                name: 'active',
                kind: 'type property',
                prefixes: 'is, has, should, can, did, will, was',
              },
            },
          ],
        },
        // Arrow function param without boolean prefix - NOT OK
        {
          code: `const fn = (active: boolean) => {}`,
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
      ],
    })
  })
})
