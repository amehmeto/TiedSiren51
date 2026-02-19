/**
 * @fileoverview Tests for prefer-short-circuit-jsx rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./prefer-short-circuit-jsx.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('prefer-short-circuit-jsx', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-short-circuit-jsx', rule, {
      valid: [
        // Already using short-circuit
        {
          code: `function C() { return <div>{isVisible && <Comp />}</div> }`,
        },
        // Ternary with non-null alternate (real branch, not simplifiable)
        {
          code: `function C() { return <div>{isVisible ? <Comp /> : <Other />}</div> }`,
        },
        // Ternary with null consequent (reversed pattern, not targeted)
        {
          code: `function C() { return <div>{isVisible ? null : <Comp />}</div> }`,
        },
        // Ternary with non-JSX consequent
        {
          code: `function C() { return <div>{isVisible ? "text" : null}</div> }`,
        },
        // Ternary outside JSX/return context
        {
          code: `const x = isVisible ? someFunc() : null`,
        },
        // Ternary in return with non-JSX consequent
        {
          code: `function C() { return isVisible ? "text" : null }`,
        },
      ],

      invalid: [
        // Basic pattern in JSX expression container
        {
          code: `function C() { return <div>{isVisible ? <Comp /> : null}</div> }`,
          output: `function C() { return <div>{isVisible && (<Comp />)}</div> }`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
        // In return statement
        {
          code: `function C() { return isVisible ? <Comp /> : null }`,
          output: `function C() { return isVisible && (<Comp />) }`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
        // In variable declarator
        {
          code: `const el = isVisible ? <Comp /> : null`,
          output: `const el = isVisible && (<Comp />)`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
        // In assignment expression
        {
          code: `function C() { let el; el = isVisible ? <Comp /> : null }`,
          output: `function C() { let el; el = isVisible && (<Comp />) }`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
        // With compound LogicalExpression condition — wraps in parens
        {
          code: `function C() { return <div>{a && b ? <Comp /> : null}</div> }`,
          output: `function C() { return <div>{(a && b) && (<Comp />)}</div> }`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
        // With compound BinaryExpression condition — wraps in parens
        {
          code: `function C() { return <div>{a === b ? <Comp /> : null}</div> }`,
          output: `function C() { return <div>{(a === b) && (<Comp />)}</div> }`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
        // With JSX Fragment consequent
        {
          code: `function C() { return <div>{isVisible ? <><Comp /></> : null}</div> }`,
          output: `function C() { return <div>{isVisible && (<><Comp /></>)}</div> }`,
          errors: [{ messageId: 'preferShortCircuit' }],
        },
      ],
    })
  })
})
