/**
 * @fileoverview Tests for no-entire-state-selector rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-entire-state-selector.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-entire-state-selector', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-entire-state-selector', rule, {
      valid: [
        // Selecting a slice - OK
        {
          code: `useSelector((s) => s.blockSession)`,
        },
        // Selecting nested property - OK
        {
          code: `useSelector((state) => state.auth.user)`,
        },
        // Block body returning slice - OK
        {
          code: `useSelector((s) => { return s.blocklist })`,
        },
        // Function expression returning slice - OK
        {
          code: `useSelector(function(s) { return s.siren })`,
        },
        // Variable reference to valid selector - OK
        {
          code: `
        const selectSlice = (s) => s.blockSession
        useSelector(selectSlice)
      `,
        },
        // Not useSelector call - OK
        {
          code: `otherFunction((s) => s)`,
        },
        // useSelector without arguments - OK
        {
          code: `useSelector()`,
        },
        // useSelector with non-function argument - OK
        {
          code: `useSelector(selectSomething)`,
        },
        // Arrow function with destructuring param - OK
        {
          code: `useSelector(({ auth }) => auth)`,
        },
        // Multiple statements in block - OK (not just return)
        {
          code: `useSelector((s) => { const x = s; return x.slice })`,
        },
        // Return without argument - OK
        {
          code: `useSelector((s) => { return })`,
        },
        // Empty block - OK
        {
          code: `useSelector((s) => {})`,
        },
        // Arrow function with no params - OK
        {
          code: `useSelector(() => defaultState)`,
        },
        // Function expression with no params - OK
        {
          code: `useSelector(function() { return defaultState })`,
        },
        // Variable reference to non-selector function - OK
        {
          code: `
        const selectSlice = (s) => s.auth.user
        useSelector(selectSlice)
      `,
        },
        // Block with empty statement and valid return - OK
        {
          code: `useSelector((s) => { ; return s.slice })`,
        },
        // Callee is not Identifier - OK
        {
          code: `obj.useSelector((s) => s)`,
        },
      ],

      invalid: [
        // Arrow function expression body - NOT OK
        {
          code: `useSelector((s) => s)`,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Different param name - NOT OK
        {
          code: `useSelector((state) => state)`,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Arrow function block body - NOT OK
        {
          code: `useSelector((s) => { return s })`,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Function expression - NOT OK
        {
          code: `useSelector(function(s) { return s })`,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Variable reference to entire state selector - NOT OK
        {
          code: `
        const selectAll = (s) => s
        useSelector(selectAll)
      `,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Variable reference with block body - NOT OK
        {
          code: `
        const selectEntire = (state) => { return state }
        useSelector(selectEntire)
      `,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Block with empty statement but still returns entire state - NOT OK
        {
          code: `useSelector((s) => { ; return s })`,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Function expression variable - NOT OK
        {
          code: `
        const fn = function(s) { return s }
        useSelector(fn)
      `,
          errors: [{ messageId: 'noEntireState' }],
        },
        // Variable reference with hoisting (via scope analysis fallback) - NOT OK
        {
          code: `
        function Component() {
          useSelector(selectAll)
          var selectAll = (s) => s
        }
      `,
          errors: [{ messageId: 'noEntireState' }],
        },
      ],
    })
  })
})
