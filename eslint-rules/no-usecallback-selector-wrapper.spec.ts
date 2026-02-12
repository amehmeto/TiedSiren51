/**
 * @fileoverview Tests for no-usecallback-selector-wrapper rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-usecallback-selector-wrapper.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-usecallback-selector-wrapper', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-usecallback-selector-wrapper', rule, {
      valid: [
        // Direct inline selector - preferred pattern
        {
          code: `
        const isActive = useSelector((state) => selectIsActive(state, dep))
      `,
        },
        // useCallback with non-empty deps is fine (has actual dependencies)
        {
          code: `
        const selectX = useCallback((state) => selectSomething(state, dep), [dep])
        const x = useSelector(selectX)
      `,
        },
        // useCallback not used with useSelector - different use case
        {
          code: `
        const handleClick = useCallback((state) => doSomething(state), [])
        onClick(handleClick)
      `,
        },
        // useSelector with inline function
        {
          code: `
        const x = useSelector((state) => state.foo)
      `,
        },
        // useCallback with multiple params - not a selector pattern
        {
          code: `
        const fn = useCallback((a, b) => a + b, [])
        const x = useSelector(fn)
      `,
        },
        // useCallback with no params - not a selector pattern
        {
          code: `
        const fn = useCallback(() => 42, [])
        const x = useSelector(fn)
      `,
        },
      ],

      invalid: [
        // Basic case: useCallback with empty deps used in useSelector
        {
          code: `
        const selectIsActive = useCallback((state) => selectIsStrictModeActive(state, dep), [])
        const isActive = useSelector(selectIsActive)
      `,
          errors: [{ messageId: 'unnecessaryWrapper' }],
        },
        // With TypeScript-style type annotation pattern
        {
          code: `
        const selectTimeLeft = useCallback((state) => selectStrictModeTimeLeft(state, dateProvider), [])
        const timeLeft = useSelector(selectTimeLeft)
      `,
          errors: [{ messageId: 'unnecessaryWrapper' }],
        },
        // Multiple selectors in same component
        {
          code: `
        const selectA = useCallback((state) => getA(state), [])
        const selectB = useCallback((state) => getB(state), [])
        const a = useSelector(selectA)
        const b = useSelector(selectB)
      `,
          errors: [
            { messageId: 'unnecessaryWrapper' },
            { messageId: 'unnecessaryWrapper' },
          ],
        },
        // Arrow function returning call expression
        {
          code: `
        const selectFoo = useCallback((s) => getFoo(s, config), [])
        const foo = useSelector(selectFoo)
      `,
          errors: [{ messageId: 'unnecessaryWrapper' }],
        },
      ],
    })
  })
})
