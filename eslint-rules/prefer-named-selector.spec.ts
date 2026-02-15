/**
 * @fileoverview Tests for prefer-named-selector rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-named-selector.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('prefer-named-selector', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-named-selector', rule, {
      valid: [
        // Named selector - preferred pattern
        {
          code: `useSelector(selectToast)`,
        },
        // Calling selector with dependencies - OK
        {
          code: `useSelector((state) => selectIsStrictModeActive(state, dateProvider))`,
        },
        // Nested property access - OK (more specific than slice)
        {
          code: `useSelector((state) => state.auth.user)`,
        },
        // Computed/derived value - OK
        {
          code: `useSelector((state) => state.items.filter(i => i.active))`,
        },
        // Method call on slice - OK
        {
          code: `useSelector((state) => state.items.length)`,
        },
        // Multiple statements in block - OK (complex logic)
        {
          code: `useSelector((state) => { const x = state.foo; return x.bar })`,
        },
        // Destructuring param - OK (different pattern)
        {
          code: `useSelector(({ toast }) => toast)`,
        },
        // Computed property access - OK
        {
          code: `useSelector((state) => state['toast'])`,
        },
        // No arguments - OK
        {
          code: `useSelector()`,
        },
        // Multiple params - OK (not a selector pattern)
        {
          code: `useSelector((state, props) => state.foo)`,
        },
        // Not useSelector - OK
        {
          code: `otherFunction((state) => state.toast)`,
        },
        // No params - OK
        {
          code: `useSelector(() => defaultValue)`,
        },
        // Return without argument - OK
        {
          code: `useSelector((state) => { return })`,
        },
        // Empty block - OK
        {
          code: `useSelector((state) => {})`,
        },
        // Selector with extra args - OK (not a passthrough)
        {
          code: `useSelector((state) => selectFiltered(state, filter))`,
        },
        // Selector with no args - OK (different call pattern)
        {
          code: `useSelector((state) => selectAll())`,
        },
      ],

      invalid: [
        // Direct slice access - arrow function expression
        {
          code: `useSelector((state) => state.toast)`,
          errors: [
            {
              messageId: 'preferNamedSelector',
              data: { sliceName: 'toast', SliceName: 'Toast' },
            },
          ],
        },
        // Different param name
        {
          code: `useSelector((s) => s.blockSession)`,
          errors: [
            {
              messageId: 'preferNamedSelector',
              data: { sliceName: 'blockSession', SliceName: 'BlockSession' },
            },
          ],
        },
        // Block body with return
        {
          code: `useSelector((state) => { return state.auth })`,
          errors: [
            {
              messageId: 'preferNamedSelector',
              data: { sliceName: 'auth', SliceName: 'Auth' },
            },
          ],
        },
        // Function expression
        {
          code: `useSelector(function(state) { return state.siren })`,
          errors: [
            {
              messageId: 'preferNamedSelector',
              data: { sliceName: 'siren', SliceName: 'Siren' },
            },
          ],
        },
        // With rootState naming
        {
          code: `useSelector((rootState) => rootState.blocklist)`,
          errors: [
            {
              messageId: 'preferNamedSelector',
              data: { sliceName: 'blocklist', SliceName: 'Blocklist' },
            },
          ],
        },
        // Redundant wrapper around named selector
        {
          code: `useSelector((state) => selectLoginViewModel(state))`,
          output: `useSelector(selectLoginViewModel)`,
          errors: [
            {
              messageId: 'redundantSelectorWrapper',
              data: { selectorName: 'selectLoginViewModel' },
            },
          ],
        },
        // Redundant wrapper with different param name
        {
          code: `useSelector((s) => selectFoo(s))`,
          output: `useSelector(selectFoo)`,
          errors: [
            {
              messageId: 'redundantSelectorWrapper',
              data: { selectorName: 'selectFoo' },
            },
          ],
        },
        // Redundant wrapper in block body
        {
          code: `useSelector((state) => { return selectBar(state) })`,
          output: `useSelector(selectBar)`,
          errors: [
            {
              messageId: 'redundantSelectorWrapper',
              data: { selectorName: 'selectBar' },
            },
          ],
        },
      ],
    })
  })
})
