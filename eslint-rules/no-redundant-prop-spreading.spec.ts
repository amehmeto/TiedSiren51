/**
 * @fileoverview Tests for no-redundant-prop-spreading rule
 */

import { createRequire } from 'module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)
const rule = require('./no-redundant-prop-spreading.cjs')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('no-redundant-prop-spreading', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-redundant-prop-spreading', rule, {
      valid: [
        // Props from different objects — fine
        { code: '<Component a={x.a} b={y.b} c={z.c} />' },
        // Only 2 props from same object (below default threshold of 3)
        { code: '<Component a={obj.a} b={obj.b} />' },
        // Props are not member expressions
        { code: '<Component a={a} b={b} c={c} />' },
        // Custom threshold: 2 props from same object, threshold 3
        {
          code: '<Component a={obj.a} b={obj.b} />',
          options: [{ threshold: 3 }],
        },
        // Spread props — different pattern
        { code: '<Component {...obj} />' },
        // Mixed member expressions and non-member expressions
        { code: '<Component a={obj.a} b={obj.b} c="literal" />' },
        // Ignored objects should not trigger the rule
        {
          code: '<Component a={styles.a} b={styles.b} c={styles.c} />',
          options: [{ ignoredObjects: ['styles'] }],
        },
        // React special props (key, ref) should not count
        { code: '<Component key={obj.id} a={obj.a} b={obj.b} />' },
      ],

      invalid: [
        // 3 props from same object (hits default threshold)
        {
          code: '<Component a={obj.a} b={obj.b} c={obj.c} />',
          errors: [
            {
              messageId: 'noRedundantPropSpreading',
              data: { props: 'a, b, c', objectName: 'obj' },
            },
          ],
        },
        // Custom threshold of 2
        {
          code: '<Component a={obj.a} b={obj.b} />',
          options: [{ threshold: 2 }],
          errors: [
            {
              messageId: 'noRedundantPropSpreading',
              data: { props: 'a, b', objectName: 'obj' },
            },
          ],
        },
        // 4 props from same object
        {
          code: '<Component a={obj.a} b={obj.b} c={obj.c} d={obj.d} />',
          errors: [
            {
              messageId: 'noRedundantPropSpreading',
              data: { props: 'a, b, c, d', objectName: 'obj' },
            },
          ],
        },
      ],
    })
  })
})
