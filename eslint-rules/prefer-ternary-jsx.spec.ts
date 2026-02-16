/**
 * @fileoverview Tests for prefer-ternary-jsx rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-ternary-jsx.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('prefer-ternary-jsx', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-ternary-jsx', rule, {
      valid: [
        // Single condition - no complement
        {
          code: `<div>{isLocked && <LockIcon />}</div>`,
        },
        // Already a ternary
        {
          code: `<div>{isLocked ? <LockIcon /> : <CheckBox />}</div>`,
        },
        // Different conditions
        {
          code: `<div>{isLocked && <LockIcon />}{isSelected && <CheckBox />}</div>`,
        },
        // Both positive (same condition, no negation)
        {
          code: `<div>{isLocked && <LockIcon />}{isLocked && <Other />}</div>`,
        },
        // Non-&& logical expressions
        {
          code: `<div>{isLocked || <LockIcon />}{!isLocked || <CheckBox />}</div>`,
        },
      ],

      invalid: [
        // Simple complementary conditions
        {
          code: `<div>{isLocked && <LockIcon />}{!isLocked && <CheckBox />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
        // Negation first, positive second
        {
          code: `<div>{!isLocked && <CheckBox />}{isLocked && <LockIcon />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
        // With other children in between
        {
          code: `<div>{isLocked && <LockIcon />}<Text>hello</Text>{!isLocked && <CheckBox />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
        // Member expression condition
        {
          code: `<div>{user.isAdmin && <AdminPanel />}{!user.isAdmin && <UserPanel />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'user.isAdmin' },
            },
          ],
        },
        // Inside a fragment
        {
          code: `<>{isLocked && <LockIcon />}{!isLocked && <CheckBox />}</>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
      ],
    })
  })
})
