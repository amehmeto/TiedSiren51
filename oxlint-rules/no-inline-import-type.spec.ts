/**
 * @fileoverview Tests for no-inline-import-type rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import { createRequire } from 'node:module'

import rule from './no-inline-import-type.js'

const require = createRequire(import.meta.url)

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
})

describe('no-inline-import-type', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-inline-import-type', rule, {
      valid: [
        // Normal type import - OK
        {
          code: `import { AndroidSiren } from '@/core/siren/sirens'`,
        },
        // Normal value import - OK
        {
          code: `import { something } from 'module'`,
        },
        // Dynamic import for runtime - OK
        {
          code: `const mod = await import('module')`,
        },
        // Type keyword import - OK
        {
          code: `import type { Foo } from 'bar'`,
        },
      ],

      invalid: [
        // Inline import type in type alias - NOT OK
        {
          code: `type Foo = import('bar').Baz`,
          errors: [{ messageId: 'noInlineImportType' }],
        },
        // Inline import type in variable annotation - NOT OK
        {
          code: `const x: import('bar').Baz = value`,
          errors: [{ messageId: 'noInlineImportType' }],
        },
        // Inline import type in function parameter - NOT OK
        {
          code: `function fn(param: import('@/core/siren/sirens').AndroidSiren) {}`,
          errors: [{ messageId: 'noInlineImportType' }],
        },
        // Inline import type in return type - NOT OK
        {
          code: `function fn(): import('module').Type { return value }`,
          errors: [{ messageId: 'noInlineImportType' }],
        },
        // Inline import type without qualifier - NOT OK (falls back to 'Type')
        {
          code: `type Foo = import('bar')`,
          errors: [{ messageId: 'noInlineImportType' }],
        },
      ],
    })
  })
})
