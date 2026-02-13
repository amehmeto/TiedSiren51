/**
 * @fileoverview Tests for use-data-builders rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./use-data-builders.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('use-data-builders', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('use-data-builders', rule, {
      valid: [
        // Using data builder - OK
        {
          code: `const session: BlockSession = buildBlockSession()`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Using builder with overrides - OK
        {
          code: `const session: BlockSession = buildBlockSession({ id: '123' })`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Not a tracked entity type - OK
        {
          code: `const user: User = { name: 'John' }`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Union type - OK (not tracked, getTypeName returns null)
        {
          code: `const value: BlockSession | null = null`,
          filename: '/project/core/auth/auth.test.ts',
        },
        // Non-test file - should not apply
        {
          code: `const session: BlockSession = { id: '123' }`,
          filename: '/project/core/auth/auth.ts',
        },
        // Fixture file - OK (builders are used in fixtures)
        {
          code: `const session: BlockSession = buildBlockSession()`,
          filename: '/project/core/auth/auth.fixture.ts',
        },
        // Spec file - OK with builder
        {
          code: `const session: BlockSession = buildBlockSession()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Variable without type annotation
        {
          code: `const session = buildBlockSession()`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Declarator without init (just type annotation)
        {
          code: `let session: BlockSession`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Assignment to non-Identifier (MemberExpression)
        {
          code: `
        let obj: { session: BlockSession }
        obj.session = { id: '123' }
      `,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Array with spread element (not ObjectExpression)
        {
          code: `const sessions: BlockSession[] = [...existingSessions]`,
          filename: '/project/core/auth/auth.spec.ts',
        },
        // Array with non-object elements (function call)
        {
          code: `const sessions: BlockSession[] = [buildBlockSession()]`,
          filename: '/project/core/auth/auth.spec.ts',
        },
      ],

      invalid: [
        // Object literal for BlockSession - NOT OK
        {
          code: `const session: BlockSession = { id: '123', name: 'test' }`,
          filename: '/project/core/auth/auth.test.ts',
          errors: [
            {
              messageId: 'useDataBuilder',
              data: {
                typeName: 'BlockSession',
                builderName: 'buildBlockSession',
              },
            },
          ],
        },
        // Object literal for Blocklist - NOT OK
        {
          code: `const blocklist: Blocklist = { id: '123', name: 'work' }`,
          filename: '/project/core/blocklist/blocklist.test.ts',
          errors: [
            {
              messageId: 'useDataBuilder',
              data: { typeName: 'Blocklist', builderName: 'buildBlocklist' },
            },
          ],
        },
        // Array of object literals - NOT OK
        {
          code: `const sessions: BlockSession[] = [{ id: '1' }, { id: '2' }]`,
          filename: '/project/core/session/session.test.ts',
          errors: [
            {
              messageId: 'useDataBuilder',
              data: {
                typeName: 'BlockSession',
                builderName: 'buildBlockSession',
              },
            },
            {
              messageId: 'useDataBuilder',
              data: {
                typeName: 'BlockSession',
                builderName: 'buildBlockSession',
              },
            },
          ],
        },
        // Assignment after declaration - NOT OK
        {
          code: `
        let session: BlockSession
        session = { id: '123' }
      `,
          filename: '/project/core/session/session.test.ts',
          errors: [
            {
              messageId: 'useDataBuilder',
              data: {
                typeName: 'BlockSession',
                builderName: 'buildBlockSession',
              },
            },
          ],
        },
        // Device entity - NOT OK
        {
          code: `const device: Device = { id: 'device-1', name: 'Phone' }`,
          filename: '/project/core/device/device.test.ts',
          errors: [
            {
              messageId: 'useDataBuilder',
              data: { typeName: 'Device', builderName: 'buildDevice' },
            },
          ],
        },
      ],
    })
  })
})
