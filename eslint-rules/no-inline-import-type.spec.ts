/**
 * @fileoverview Tests for no-inline-import-type rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-inline-import-type.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
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
      ],
    })
  })
})
