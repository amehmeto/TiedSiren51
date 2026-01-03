/**
 * @fileoverview Tests for no-nested-call-expressions rule
 */

const { RuleTester } = require('eslint')
const rule = require('./no-nested-call-expressions.cjs')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

ruleTester.run('no-nested-call-expressions', rule, {
  valid: [
    // Non-nested call - should NOT report
    {
      code: `foo(x)`,
    },
    // Variable as argument - should NOT report
    {
      code: `
        const result = bar(x)
        foo(result)
      `,
    },
    // Allowed inner pattern - should NOT report
    {
      code: `foo(map(items))`,
      options: [{ allowedPatterns: ['^map$'] }],
    },
    // Allowed outer pattern - should NOT report
    {
      code: `filter(inner(x))`,
      options: [{ allowedPatterns: ['^filter$'] }],
    },
    // Method call with allowed pattern - should NOT report
    {
      code: `transform(items.map(fn))`,
      options: [{ allowedPatterns: ['^map$'] }],
    },
    // Outer method call with allowed pattern - should NOT report
    {
      code: `items.filter(getValue(x))`,
      options: [{ allowedPatterns: ['^filter$'] }],
    },
    // Multiple allowed patterns - should NOT report
    {
      code: `transform(items.flatMap(fn))`,
      options: [{ allowedPatterns: ['^map$', '^flatMap$', '^filter$'] }],
    },
    // Literal arguments - should NOT report
    {
      code: `foo(42, "string", true)`,
    },
    // Object/array arguments - should NOT report
    {
      code: `foo({ a: 1 }, [1, 2, 3])`,
    },
  ],

  invalid: [
    // Basic nested call - SHOULD report
    {
      code: `foo(bar(x))`,
      errors: [{ messageId: 'noNestedCalls', data: { innerCall: 'bar(...)' } }],
    },
    // Nested method call - SHOULD report
    {
      code: `process(obj.getValue())`,
      errors: [
        { messageId: 'noNestedCalls', data: { innerCall: 'getValue(...)' } },
      ],
    },
    // Outer method call with nested function - SHOULD report
    {
      code: `obj.process(inner(x))`,
      errors: [
        { messageId: 'noNestedCalls', data: { innerCall: 'inner(...)' } },
      ],
    },
    // Multiple nested calls in same expression - SHOULD report both
    {
      code: `foo(bar(x), baz(y))`,
      errors: [
        { messageId: 'noNestedCalls', data: { innerCall: 'bar(...)' } },
        { messageId: 'noNestedCalls', data: { innerCall: 'baz(...)' } },
      ],
    },
    // With options but neither matches - SHOULD report
    {
      code: `outer(inner(x))`,
      options: [{ allowedPatterns: ['^allowed$'] }],
      errors: [
        { messageId: 'noNestedCalls', data: { innerCall: 'inner(...)' } },
      ],
    },
  ],
})
